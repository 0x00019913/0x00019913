---
layout: post
title: "A Small Foray into Cloud Generation"
author: "0x00019913"
mathjax: true
excerpt: "An approach to making moving clouds."
date: 2017-03-18 14:32:00
---

I've never played with noise algorithms, but, what with learning Cinema 4D and all, I've gotten to see lots of awesome procedurally generated noise. So I figured I'd try my hand at it.

One of the two (at the time of writing) headers I have here is inspired by that scene near the end of Code Geass (search for the "obey me, world" speech and prepare for spoilers) with the chess piece under an epic-looking red sky. The hard part, of course, was making the clouds look at least modestly cloudlike. The solution turned out to be 2D simplex noise fed into an FBM function with seven octaves.

References: the simplex code borrows heavily from <a href="http://weber.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf">the Gustavson paper</a> and <a href="https://github.com/stegu/webgl-noise/">the modified code in his repo</a>, which doesn't use lookup tables and instead does hashing and gradient generation on the fly. Also, props to <a href="https://github.com/simongeilfus/SimplexNoise">Simon Geilfus's noise repo</a> for the idea of using FBM (which would have been obvious if I weren't a noob) and for being a great source for noise-related tricks.

### Setup

The sky is just a horizontal square plane with a fragment shader - nothing interesting happens in the vertex shader. The shader gets the object-space coordinates of a point on the plane, x-y scaling factors, and a y offset, necessary for moving the clouds.

### Simplex noise

I borrowed a lot of code from the venerable Stefan Gustavson. I found the code in his paper to be more readable on the whole, so I used his F2, G2 notation for transforming the coordinates. For hashing, his repo has an alternative to the paper's lookup tables - his own hash function with some mechanics for picking a random gradient from a set of 41. I'll try to find the time and willpower to stare at it and hopefully understand it (and maybe write my own), but for now it just works.

NB: I could've totally used Perlin/"classic" noise and it would've likely looked very much like what I have now. The two also don't differ much in computational expense in 2D (although, in higher dimensions, simplex noise does become cheaper). I didn't use Perlin noise, though, simply because I wanted to cut my teeth on the more algorithmically interesting alternative.

### FBM

With straight simplex noise, we see the following problem:

<div class="img-box">
  <img src="/assets/img/clouds0.png" />
  <div class="img-caption">Before FBM.</div>
</div>

It's... kinda ugly and, moreover, not very cloudlike. If you see clouds like this IRL, expect a hot reddit thread. The solution, obvious in retrospect, is FBM.

Fractional Brownian motion, at least in the context of noise generation, is very simple - for a certain number of steps, calculate the noise at an increasing frequency, accumulate this times some amplitude, and use that as your new noise value. The parameters are octaves (the number of steps), lacunarity (the multiplicative constant that modifies the frequency at every step), and gain (modifies the amplitude that multiplies the noise value).

Putting the simplex noise through an FBM function with seven octaves (empirical; can add or subtract one or two) gives this:

<div class="img-box">
  <img src="/assets/img/clouds1.png" />
  <div class="img-caption">After FBM.</div>
</div>

Better!

### Colors

After this, all I did was a few empirically determined transformations on the resulting intensity to get it into the right color range. First, clamp the noise value (see below). Then use the noise to interpolate between a sky color and a cloud color. Then add a linear gradient (an approximation for haze), which is just the cloud color proportional to the y-value of the object-space position.

Looks a bit like an atmosphere of Cheeto dust, but still nifty.

### Making the clouds change

As described, the noise would just move linearly and never change. I found that this looks fairly boring, so I generated a second noise, set it to move at a slightly different rate, and subtracted it from the original noise. And voilà! The clouds ripple and dissipate.

### A curious inconsistency

I've been writing and testing this all in my Ubuntu VM (Chrome and Firefox). After I made the clouds all pretty-like and pushed, I looked at the header in Windows and discovered something weird - the clouds were there, but the sky was totally black. It appears that, whether this is a driver thing or an Ubuntu thing, the colors got clamped automatically to the [0,1] range for some set of calculations, while on Windows they were allowed to go negative, creating a black sky. The solution was to clamp the initial noise values and then redo the entire setup with different constants.
