---
layout: post
title: "Meshy Design Notes"
author: "0x00019913"
mathjax: true
excerpt: "Some stuff about the design decisions and efficiency concerns involved in a browser-based mesh processor."
date: 2017-03-08 11:15:00
---

The base code for <a href="https://0x00019913.github.io/meshy/">meshy</a> descends from a very crude mesh slicing visualizer I wrote to get in the mood for a job interview (based on <a href="http://www.dainf.ct.utfpr.edu.br/~murilo/public/CAD-slicing.pdf">this here paper</a>); this thing imported STL files, turned them into slices, and did nothing else. Thus, the STL format originally informed the internal data structure.

### Importing

Binary STL files, <a href="https://en.wikipedia.org/wiki/STL_(file_format)">as detailed on Wikipedia</a>, are little more than an array of binary `normal`, `vertex`, `vertex`, `vertex` blocks - four 3-vectors, each made of 32-bit floats. A given vertex will be repeated for each face that contains it - this is a wee bit inefficient. In terms of importing an STL file into an application, I ended up with an array of `Triangle` objects, each with a normal and three vertices (again, repeated).

OBJ, meanwhile, is a <a href="https://en.wikipedia.org/wiki/Wavefront_.obj_file">much more complicated ASCII format</a>. Just for geometry, it goes something like:

```
# vertex coords
v 0 0 0
v 0.1 0.2 0.3
v 5 4 3
#...

# these are normals, but they don't even have to be normalized
# note that these are per-vertex, not per-face
vn 0 1 0
vn 0.7 0.7 0
#...

# face indices; the "/..." are additional fields for texture coord and normal indices
f 1 2 3
f 4/... 5/... 6/...
#...
```

So the vertices are specified uniquely, as are the faces, which are just indices into the vertex array (notably, the indices are 1-based). Now, for our purposes, we're ignoring texture coords, "parameter space vertices", and everything that's not specified above.

(To make matters more confusing, OBJs allow n-gons by specifying more than three vertex indices per face. I threw in the towel and said that I'm not allowing n-gons above quads. And I'm triangulating the quads.)

Now, importing this into the "repeating triangle soup" thing I had is straightforward - make a list of vertex objects first, then duplicate them when making a new face. (You couldn't get away with not duplicating them because every algorithm assumed duplicated vertices - e.g., the translation function iterates through the faces, then shifts all the vertices for each face.)

### Exporting

Exporting to STL works trivially; the problem arises when trying to export as OBJ. To start, we need a list of unqiue vertices - but you might have a million of them, and iterating through the faces, each with repeated coords, building a list of unique vertices, is an $$O(\lvert V \rvert ^2)$$ problem because you need to check for membership in the list of vertices so far. We clearly need some kind of hashing scheme.

Here's what worked: I partition the space occupied by the model into an $$n$$-by-$$n$$-by-$$n$$ grid. So we have this grid, plus the vertex list which we will build. Each cell represents a spatial region; it contains a list of vertex references along with an index into the overall list of vertices we're building. We have a method that takes a vertex and checks if it's in the grid; if it's there, return its index; else, put it in the grid, push it onto the vertex list, return its index. How do we check for membership in the grid? Well, comparing equality on vertex objects is no good, since they're Javascript references; comparing equality on individual elements is no good because they're floats. So you just check if the difference of the individual coords is less than some epsilon. Standard technique.

Aaaaaaand the problem didn't stop being $$O(\lvert V \rvert ^2)$$, but it did speed up by roughly a factor of $$n^3$$ (optimistically speaking), where $$n$$ is the grid dimension. Empirically, browser memory limitations mean that you can't get to high enough vertex counts that the problem becomes intractable again, so we can tentatively call it solved.

### But Grandma, why repeat vertices?

Indeed, why do that? It took a bit of effort, but I reworked the whole project to basically follow the OBJ scheme instead - now our geometry is stored as an array of unique vertices, plus an array of `Triangle` objects, each of which has three indices into the vertex array and a normal.

So now importing OBJ works trivially, plus we don't need to duplicate vertex objects anymore. Importing STL? Bleh. We once again need to do that grid thing to build a unique vertex list so that we may have indices to then build the triangle list. What's more, we need to go through the entire model first before making anything because we need to know the bounds of the model in order to size the grid. Necessary evil, though.

The STL import is the only rough part of this, though - exporting STL and OBJ works straight up.

### What next?

Well, I'm thinking that the grid thing is pretty naive and its performance will vary with how "lumpy" the model is. That said, my only other idea is an octree isn't reeeeeeally an improvement. An octree of depth $$n$$ is just equivalent to an $$2^{n+1}$$-by-$$2^{n+1}$$-by-$$2^{n+1}$$ grid, so, in principle, the grid is even better (because it's three array dereferences to get into the right cell, while for an octree it's $$n$$ array dereferences).

Only thing going against the grid, really, is that, because it's an array of arrays of arrays, you'll get lots of arrays with one element and a bunch of undefined values, which, I'm told, are kinda weighty. This happens because Javascript allows you to assign any element of an array - if you do `a=[]; a[5] = 'foo';`, then `a` will be `[undefinedx5, 'foo']`. So, if a vertex goes in the far corner of the grid, we'll end up allocating three mostly-empty arrays. But... the upper limit on the wasted space is $$n^3$$ `undefined`s, and it will almost certainly be much less because geometry tends to be spaced out, so I feel like this is a complete non-issue.
