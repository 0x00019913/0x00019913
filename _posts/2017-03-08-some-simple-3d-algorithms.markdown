---
layout: post
title: "Some Simple 3D Algorithms"
author: "0x00019913"
mathjax: true
excerpt: "A few algorithms I had occasion to learn while writing Meshy."
date: 2017-03-08 02:10:00
---

The original impetus for writing <a href="https://0x00019913.github.io/meshy/">meshy</a> was that I had no nice tool for calculating the center of mass of a 3D mesh (of uniform density, implicitly). This model is the specific reason - it turned out the center of mass was way out of alignment with the place where the chain hooks into the orbital bones, so it ends up pitching backward if one doesn't hook it to the chain by the horns:

<div class="img-box">
  <img class="lim300" src="/assets/img/antelope.jpg" />
  <div class="img-caption">Antelope pendant.</div>
</div>

I had no idea how I was going to do this at the start, but it turned out to be fairly simple. There's a basic idea here that's used to calculate a range of related quantities - volume, COM, and even cross-sectional area. The intuition is described in <a href="http://chenlab.ece.cornell.edu/Publication/Cha/icip01_Cha.pdf">this paper</a>.

We assume that our data representation is a polygon soup - of triangles, specifically. Each triangle consists of three vertices and a normal vector.

### Volume

So let's say we wanna calculate the volume. Pick a triangle and imagine it as an irregular tetrahedrom anchored at the origin by its fourth vertex. Now calculate the volume of the tetrahedron - the paper's formula for this is:

$$V = |\frac{1}{6}(-x_3 y_2 z_1 + x_2 y_3 z_1 + x_3 y_1 z_2 - x_1 y_3 z_2 - x_2 y_1 z_3 + x_1 y_2 z_3)|$$

Make this volume negative if the normal is pointing toward the origin - this is equivalent to checking the sign of the inner product of the normal with any of the face's vertices. Now just add these signed volumes for every triangle and the total should equal the total volume.

Note that the above is independent of the location of the origin (floating-point precision issues notwithstanding, of course). It can be inside or outside the model, or it can even be on the surface.

The paper also notes that you can do away with the sign check and just add up the volume (without the absolute value) assuming a consistent winding order of the vertices.

### Center of Mass

Not much more complicated - add the coordinates of the tetrahedron, *weighted by* the individual signed volumes. Then divide the accumulated 3-vector by the total volume, which gives the center of mass. This is the same as finding the first moment.

### Cross-Sectional Area

Same logic. Take a plane and iterate through the triangles. (If you've got precalculated minima and maxima, it's easy to check whether a given triangle crosses the plane.) If there's an intersection with the plane, get the segment that forms the intersection - this will be a set of two 3-vectors signifying the endpoints of the segment. Shift both vectors down to 0 on the plane's normal axis, so that they're coplanar with the origin. This time, imagine that they're the outer edge of a triangle anchored to the origin by its last vertex; calculate the area of the triangle (this is easy - if the segment endpoints are $$v_1$$ and $$v_2$$, the area is just the length of $$\frac{1}{2} v_1 \times v_2$$). Now, you'll need to calculate a sign for this area as well - do this by checking the sign of $$v_1 \cdot n$$, where $$n$$ is the face normal. Accumulate these signed area values - that'll be the cross-section.
