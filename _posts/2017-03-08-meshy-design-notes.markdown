---
layout: post
title: "Meshy Design Notes"
author: "0x00019913"
mathjax: true
excerpt: "Some stuff about the design decisions and efficiency concerns involved in a browser-based mesh processor."
date: 2017-03-08 11:15:00
---

The base code for <a href="https://0x00019913.github.io/meshy/">meshy</a> descends from a very crude mesh slicing visualizer I wrote to get in the mood for a job interview (based on <a href="http://www.dainf.ct.utfpr.edu.br/~murilo/public/CAD-slicing.pdf">this here paper</a>); this thing imported STL files, turned them into slices, and did nothing else. Thus, the STL format originally informed the internal data structure.

Firstly, a note about Javascript: every vertex is stored as a `THREE.Vector3` object, which Javascript makes available through a reference. You can copy references: given a vertex `v`, you can do `var vp = v;`, so now `vp` will reference the same object. When I say "duplicated vertices" in the following, I mean distinct `THREE.Vector3` objects with the same coordinate values. You can manually diplicate `v` through `v.clone()`.

### Importing

A binary STL file, <a href="https://en.wikipedia.org/wiki/STL_(file_format)">as detailed on Wikipedia</a>, is little more than an array of binary `normal`, `vertex`, `vertex`, `vertex` blocks - four 3-vectors, each made of 32-bit floats. A given vertex will be repeated for each face that contains it - this is a wee bit inefficient, but it makes for a simple format. In terms of importing an STL file into an application, I ended up with an array of `Triangle` objects, each with a normal and three vertices (again, repeated).

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

Now, importing this into the "repeating triangle soup" thing I had is straightforward - make a list of vertex objects first, then duplicate them when making a new face. (You couldn't get away with not duplicating them because every algorithm assumed duplicated vertices - e.g., the translation function iterated through the faces, then shifted all the vertices for each face.)

### Exporting

Exporting to STL works trivially; the problem arises when trying to export as OBJ. To start, we need a list of unqiue vertices - but you might have a million of them, and iterating through the faces, each with repeated coords, building a list of unique vertices, is an $$O(\lvert V \rvert ^2)$$ problem because you need to check for membership in the list of vertices so far. We clearly need some kind of hashing scheme.

Originally, I'd sorta fixed this problem by partitioning the space into an $$n$$-by-$$n$$-by-$$n$$ grid and indexing the vertices so that I'd only have to check a given point's sector in the grid. But this approach is clearly somewhat naive and doesn't scale. The better solution turned up while I was reading the Three.js source code, and is really quite simple - just use a hash table and be done with it. Javascript objects are implemented with hash tables behind the scenes and are very efficient - just turn your vertex coords into a string key (appropriately rounded) and use that to store and get vertices. I'd initially dismissed the idea (even though the idea of a hash table is the obvious solution) because it seemed too good to be true that an ordinary JS object works this way, but nope! It works, and is a good deal more efficient than the previous method.

### But Grandma, why repeat vertices?

Indeed, why do that? It took a bit of effort, but I reworked the whole project to basically follow the OBJ scheme instead - now our geometry is stored as an array of unique vertices, plus an array of `Triangle` objects, each of which has three indices into the vertex array, a normal, and some `Triangle`-specific methods like calculating volumes and such.

So now importing OBJ works trivially, plus we don't need to duplicate vertex objects anymore. Importing STL? This is now where we need to do the hash table thing. Exporting STL and OBJ works straight up.

### What next?

I think some improvements (or, more accurately, reasonable tradeoffs) could be made to how meshy stores geometry. The vertices are stored as a list of `Vector3` objects, which are irreducible. The faces, though, I store as a list of `Triangle` objects, which do have some storage overhead. All they really need is three integer indices and a `Vector3` for the normal, but currently they also store the triangle bounds (`xmin`, `xmax`, etc.), a surface area, and a signed volume. These are all cached for subsequent calculations, but these calculations are fairly discrete and I'd want to experiment to see what kind of performance impact eliminating this internal storage will have.
