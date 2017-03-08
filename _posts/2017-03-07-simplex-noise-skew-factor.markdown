---
layout: post
title: "Simplex Noise Skew Factor"
author: "0x00019913"
mathjax: true
excerpt: "I explain the simplex noise skew factor."
date: 2017-03-07 16:00:00
---

So I was reading about simplex noise <a href="http://weber.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf">in the Gustavson paper</a>, right? If one understands Perlin ("classic") noise, everything's pretty straighforward by analogy, at least in 2D: imagine that your plane is partitioned into a lattice of triangles, then hash the coordinates of every triangle corner to produce a pseudo-random gradient. Now, it would be nice if the vertices were located at integer coordinates instead - so we perform whatever magic is needed to get each triangle vertex to align with a pair of integer coordinates.

> Did you know? Simplex noise was invented in 1836 by Edwin Simplex of Lancastershire, who was never terribly fond of his name.

Here's the diagram from the paper:

<div class="img-box">
  <img src="/assets/skew.png" />
  <div class="img-caption">Skewing the grid.</div>
</div>

And we get code along these lines:

```c
// skew
double F2 = 0.5*(Math.sqrt(3.0)-1.0);
double s = (x+y)*F2;
int i = floor(xin+s);
int j = floor(yin+s);

// unskew
double G2 = (3.0-Math.sqrt(3.0))/6.0;
double t = (i+j)*G2;
double X0 = i-t;
double Y0 = j-t;
```

So we just stretch the triangle grid along the $$x=y$$ line, a linear transformation. But WTH are these factors of $$\frac{\sqrt{3}-1}{2}$$ and $$\frac{\sqrt{3}-3}{6}$$? I kinda worked it out, and the solution is as follows.

Two facts about the skewing:

1. Every point is moved parallel to the $$x=y$$ line, so you'll add the same quantity to the $$x$$ and $$y$$ coords.
2. There are $$x+y = constant$$ isolines, which are normal to the $$x=y$$ line. Every point on a given isoline will move by the same amount.

So, we need to get $$(x',y')$$ given $$(x,y)$$ and the quantity $$(x+y)$$. It's a linear transformation, so $$(x+y)$$ must be involved. Let's pick a point, add $$(x+y)$$ times some constant, and figure out what this constant has to be.

(Not rigorous? I did graduate with a physics major. XD)

So let's take that point that's just north-east of the origin. What are its coordinates? Turns out it's at $$(\frac{1}{\sqrt{3}},\frac{1}{\sqrt{3}})$$. This makes the triangles $$\sqrt{\frac{2}{3}}$$ long on a side. Why? Dunno. I guess Ken Perlin came up with the quantity and everyone kinda followed along. This length does not seem to be specified anywhere, and assuming a different length produces a different result.

Need to turn this point into $$(1,1)$$. By fact 1, we need only work with the x-coord. Given $$x+y=\frac{2}{\sqrt{3}}$$, we solve $$x + (x+y)k = x'$$:

$$\frac{1}{\sqrt{3}} + \frac{2}{\sqrt{3}}k = 1$$

And lo! $$k = \frac{\sqrt{3}-1}{2}$$.

Likewise, if we wanna unskew from $$(1,1)$$ to $$(\frac{1}{\sqrt{3}},\frac{1}{\sqrt{3}})$$, we solve $$1 + (1+1)k' = \frac{1}{\sqrt{3}}$$ to get $$k' = \frac{\sqrt{3}-3}{6}$$.
