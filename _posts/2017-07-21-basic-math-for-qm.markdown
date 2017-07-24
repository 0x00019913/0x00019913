---
layout: post
title: "Some Basic Math for Quantum Mechanics"
author: "0x00019913"
mathjax: true
excerpt: "A condensed presentation of the very fundamental linear algebra used in QM."
date: 2017-07-21 02:16:00
---

I've been reading a book on quantum computing lately (Nielsen and Chuang) and I thought I'd write a hyper-condensed review of the super-fundamental bits required for pure QM, but restricted to quantum computing. I'm not sure how human-readable this is in general, but the math will be easy for anyone who's taken an undergrad course. Of course, the disclaimer is that I mostly come from an undergrad education and lots of reading in my free time, so don't take this as gospel.

NB: because this is in the context of quantum computing, I will make no mention of infinite-dimentional Hilbert spaces. If I were to include those, I'd take my cues from the first chapter of Shankar's QM book instead, which is a rather weighty read. I also won't talk about metrics because that's general relativity land, and there be dragons.

Lastly, this won't be nearly the full material - more of a reminder for myself of the results and some background stuff for convenience.

## Notation

$$A^\top$$ is the transpose of a column vector or matrix $$A$$.

$$A^* $$ is the complex conjugate of the elements of a vector or matrix $$A$$.

$$A^\dagger = A^{* ^{\top }} $$ (AKA "dagger") is the conjugate transpose of a vector or matrix $$A$$. Lots of literature uses the asterisk to represent this, which cost me some homework points back when I was learning this and didn't know any better. The asterisk will now and forever mean complex conjugate.

## Vector Spaces

We denote a vector as $$\lvert v\rangle$$, or $$v$$ for short if it's obvious what we're talking about. Say $$V$$ is a set of vectors. Then $$V$$ is a vector space if for any $$\lvert u\rangle, \lvert v\rangle, \lvert w\rangle \in V$$ and $$a, b \in \mathbb{C}$$:

1. Addition is associative: $$u + (v + w) = (u + v) + w$$
2. Addition is commutative: $$u + v = v + u$$
3. There exists $$0 \in V$$ s.t. $$v + 0 = v$$. (Note that the $$0$$ here is shorthand for the vector $$\lvert 0\rangle$$, not a scalar $$0$$.)
4. Additive inverse: there exists $$-v \in V$$ s.t. $$v + (-v) = 0$$.
5. Closed under linear combinations: $$a u + b v \in V$$.
6. <a href="https://en.wikipedia.org/wiki/Vector_space#Definition">...and a couple of others.</a>

We normally think of a vector $$\lvert v\rangle$$ in an $$n$$-dimensional vector space $$V$$ as an n-tuple of numbers, i.e., the column vector $$(v_1, ..., v_n)^\top$$, where $$\lvert v\rangle = \sum_i v_i \lvert i\rangle$$ for a particular orthonormal basis $$\lvert i\rangle$$. Change basis and the tuple representing the vector in that basis will be different.

A vector can also be a function or even a matrix, as long as it satisfies the standard properties, but, for our purposes, we'll use the tuple representation.

## Bases

A set of vectors $$\lvert v_1\rangle, \ldots, \lvert v_n\rangle$$ is linearly independent if no vector in this set can be written as a linear combination of the others, i.e., for any coefficients $$a_i$$,

$$\sum_i a_i \lvert v_i\rangle = 0 \implies a_i = 0$$

If a set of $$n$$ linearly independent vectors spans the given vector space $$V$$ (i.e., every vector $$\lvert v\rangle$$ in $$V$$ can be written as a linear combination of these vectors), then it's a basis. The number of vectors in the basis is the dimension of the space.

## Linear Operators

An operator $$A$$ is a map $$A : V \rightarrow W$$, i.e., it takes a vector in $$V$$ and maps it to a vector in $$W$$. All our operators will be linear:

$$A \sum_i v_i \lvert i\rangle = \sum_i v_i A \lvert i\rangle$$

So operators distribute into and out of sums and everything is peachy. The identity map $$I$$ is customarily written without reference to any particular basis or dimensionality and is understood to take any vector and scalar into itself.

Importantly, if we have a basis $$\lvert v_i\rangle$$ of $$V$$ and basis $$\lvert w_i\rangle$$ of W, we recognize that A operating on some vector $$\lvert v_j\rangle$$ produces some linear combination of $$W$$'s basis vectors, which we call $$A$$'s matrix elements. This indicates that

1. the operator has a representation as a matrix, and
2. this representation is basis-dependent.

## Inner Products and Dual Vectors

The inner products of two vectors $$\lvert w\rangle$$ and $$\lvert v\rangle$$, respectively, is written as $$\langle w\lvert v\rangle$$. This is Dirac's bra-ket notation and, mysteriously, is never used outside physics. Specifically, the $$\lvert v\rangle$$ is a "ket" and the $$\langle w\lvert$$ is a "bra".

The inner product of two vectors $$\lvert u\rangle$$ and $$\lvert v\rangle$$, respectively, is defined (assuming we represent our vectors as n-tuples) as

$$\langle u\lvert v\rangle = \lvert u\rangle^\dagger \lvert v\rangle = \sum_i u_i^* v_i$$

where the two vectors are represented in the same orthonormal basis and $$u_i$$ and $$v_i$$ are their coefficients.

The magnitude of a vector $$\lvert v\rangle$$ is written as

$$\lvert \lvert v \rvert \rvert = \sqrt{\langle v\lvert v\rangle}$$

This thing is obviously real and non-negative if we believe our definition of the inner product.

($$\langle w\lvert$$, strictly speaking, is a dual vector to $$\lvert w\rangle$$. It's a map $$\langle w\lvert : V \rightarrow \mathbb{C}$$ that takes a vector and turns it into a number. If you have an orthonormal basis of vectors $$\lvert v_i\rangle$$ for vector space $$V$$, we can define a dual basis to it as the set $$\langle w_i\rvert$$ such that $$\langle w_i\lvert v_j\rangle = \delta^i_j$$. Again, not delving into metrics here. That discussion can be found in innumerable sources, e.g., Wald's general relativity book.)

## Gram-Schmidt Orthonormalization

Leaving this here for future reference: given a potentially non-orthonormal basis $$\lvert v\rangle$$, we can turn it into an orthonormal one $$\lvert w\rangle$$. First, take $$\lvert w_1\rangle = \frac{\lvert v_1\rangle}{\lvert\lvert v_1\rvert\rvert}$$. Then, for $$i = 2 \ldots n$$, take the original $$\lvert v_i\rangle$$, subtract its projection onto all the $$\lvert w_j\rangle$$s we've calculated, then normalize. This iterative procedure gives us $$\lvert w_i\rangle$$.

So for $$i = 2 \ldots n$$:

$$\lvert w_i\rangle = \frac{\lvert v_i\rangle - \sum_{j=1}^{i-1} \langle w_j \lvert v_i\rangle \lvert w_j\rangle}{\lvert\lvert \cdot \rvert\rvert}$$

where the denominator is just the magnitude of the numerator, for the sake of clean-ish notation.

## Outer Products, Projection Operators, Completeness Relation

An outer product of two vectors $$\lvert w\rangle \in W$$ and $$\lvert v\rangle \in V$$ is written as $$\lvert w\rangle\langle v\rvert$$. This is a linear operator; it's also a map $$V \rightarrow W$$.

Suppose we have vector $$\lvert v\rangle = \sum_i v_i \lvert i\rangle$$. Let's operate on it with the quantity $$\sum_i \lvert i\rangle\langle i\rvert$$:

$$\Big(\sum_i \lvert i\rangle\langle i\rvert\Big) \lvert v\rangle = \sum_i \lvert i\rangle\langle i\rvert v\rangle = \sum_i v_i\lvert i\rangle = \lvert v\rangle$$

It must be, then, that $$\sum_i \lvert i\rangle\langle i\rvert = I$$. So we can dump it in the middle of any string of vector-operator operations without changing the result.

For instance, let's take operator $$A : V \rightarrow W$$ and find its representation with respect to a particular basis $$\lvert v_i\rangle$$ of $$V$$ and $$\lvert w_j\rangle$$ of $$W$$:

$$A = I A I = \Big(\sum_i \lvert v_i\rangle\langle v_i\lvert \Big) A \Big(\sum_j \lvert w_j\rangle\langle w_j\rvert \Big) = \sum_{ij} \langle v_i \lvert A \rvert w_j \rangle \lvert v_i\rangle\langle w_j\rvert$$

Here $$\langle v_i \lvert A \rvert w_j \rangle$$ is the matrix element of $$A$$. This is a scalar.

A single term P = $$\lvert i\rangle\langle i\rvert$$ is a projection operator onto the $$i$$th basis element; P = $$\sum_{j \in S} \lvert j\rangle\langle j\rvert = I$$ for some set of indices $$S$$ is a projection onto that subspace. One can verify that $$P P = P$$.

(More later.)
