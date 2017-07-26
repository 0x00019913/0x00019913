---
layout: post
title: "Two Cents on Dynamic Programming"
author: "0x00019913"
mathjax: true
excerpt: "Some dynamic programming problems with explained solutions."
date: 2017-07-24 23:48:00
hidden: 0
---

* TOC
{:toc}

Of the elementary topics in computer science, I've found dynamic programming to be the most weirdly difficult to intuit to my satisfaction. So here's a little compendium, in no particular order, of standard-ish problems with brief explanations and explicit recursions. I'll use the symbol `M` to denote the optimal solution.

I won't go into code nor write out how the top-down approach turns into bottom-up; it tends to be a comparatively easy conversion.

## But First...

tl;dr: DP is hard.

The way to solve a dynamic programming problem seems to hinge, anticlimactically, on internalizing the thing everyone says to do: break the problem into smaller problems.

Often the reasoning will be of the form "let's take an arbitrary subproblem and figure out the ways we could've arrived at that problem from some smaller subproblem" (e.g., the knapsack problem or the domino tiling problem) or, equivalently, "take a subproblem and enumerate the ways it could be reduced to a smaller subproblem". The degrees of freedom in a problem are a determining factor: for instance, when finding the longest palindromic subsequence of a string, you have to match up pairs of characters and so end up closing in from both ends of the string; thus the optimum `M` is bivariate and the runtime ends up being $$O(n^2)$$.

Additionally, a repeating pattern (or perhaps even a defining feature) seems to be the task of finding a path through the problem that extremizes a quantity; this quantity is `M`. The result of the calculation will tell you the extremum but not the path, but you can trace it back by looking at the intermediate values of `M`.

In a sense, I won't provide a justification for *why* dynamic programming is the right approach to a problem; I'll just describe how you do it and leave it at that. It's entirely up to the solver to recognize a dynamic programming problem as such.

## 0/1 Knapsack

We have an array of $$n$$ values $$\{v_1, \ldots, v_n\}$$ and an array of corresponding weights $$\{w_1, \ldots, w_n\}$$. The knapsack's weight capacity is $$W$$ and we'd like to pick items to put into the knapsack while maximizing the total value and not overfilling the knapsack.

### Logic

The subproblems are the elements from $$0$$ to $$i$$. Start with the full list of items cut it down item by item from the end, iterating from $$i=n$$ to $$i=1$$ and keeping track of how much capacity we have. `M` is the total value in the knapsack at a given point. Note that the optimum varies with $$i$$ and with capacity, so we'll have a bivariate `M`.

Consider the $$i$$th item, with value $$v_i$$ and weight $$w_i$$, while the knapsack has $$C$$ units of capacity left. Two cases here:

1. The item doesn't fit ($$w_i > C$$), so the value in the knapsack is the same as at the next step (item $$i-1$$).
2. The item fits, so we can take it or not take it. If we take it, the value of `M` at this item is $$v_i$$ plus the `M` we get at item $$i-1$$, but we'll only have $$C-w_i$$ units of capacity to use with that item. If we don't take $$i$$, we just move on to $$i-1$$ with the same knapsack capacity. The value at $$i$$ is the max of these two possibilities.

### Recursion

$$
M[i, C] = \left\{\begin{aligned}
&M[i-1, C] &&: w_i>C \\
&\max(v_i + M[i-1, C-w_i], M[i-1, C]) &&: w_i \le C
\end{aligned}
\right.
$$

## Longest Palindromic Subsequence

Given a string $$S$$ of length $$n$$, e.g., "AEDCFDEC", find the length of the longest subsequence, not necessarily contiguous, that is a palindrome (LPS). Here it would be "EDCDE".

### Logic

We again start cutting elements off the edge, but this time we do it off both ends independently. Why? Hindsight. :P My intuition is that we end up zeroing in on both ends of the palindrome and the palindromes nested inside, so we need to vary both the start and end. (This means we again have a bivariate `M`.)

The subproblems are the substrings of $$S$$, specifically $$S[i \ldots j]$$. `M` is the length of the palindromic subsequence.

Start from the ends of a particular substring. Are the two endpoints equal ($$S[i] = S[j]$$)? Then we might as well include those in whatever palindromic substring it contains, so `M` for this $$i,j$$ pair equals 2 plus the length of the substring excluding its two endpoints. Are the endpoints not equal? Then `M` is the length of the LPS of the same substring minus one of its endpoints (take the max of the two choices).

### Recursion

$$
M[i, j] = \left\{\begin{aligned}
&2 + M[i+1, j-1] &&: S[i] = S[j] \\
&\max(M[i+1, j], M[i, j-1]) &&: S[i] \neq S[j]
\end{aligned}
\right.
$$

## Longest Common Subsequence

Maybe the best-known DP problem.

Say we have two strings $$A$$ and $$B$$, e.g., "AGCAT" and "GAC". Find the length of the longest common subsequence (not necessarily contiguous within either string). Here the LCS is "GA" or "AC".

### Logic

Because we're not comparing earlier and later elements as we did in the LPS problem, we can just have one iterator for each string. Let's say the subproblems are the substrings up to character $$i$$ and $$j$$ of the two strings, respectively. `M` is still bivariate, though.

Say we have two substrings. Are the last characters equal ($$A[i] = B[j]$$)? Then we might as well include those in the common substring. So `M` here is 1 plus whatever the LCS is of these two substrings excluding the endpoints. Are they different? Then we see what happens if we ignore either one of them, i.e., `M` is the max of the LCSes after ignoring one or the other.

The edge case is $$i=0$$ or $$j=0$$, in which case `M` is $$0$$ because a substring of length $$0$$ can't have an LCS with any other string.

### Recursion

$$
M[i, j] = \left\{\begin{aligned}
&1 + M[i-1, j-1] &&: A[i] = B[j] \\
&\max(M[i-1, j], M[i, j-1]) &&: A[i] \neq B[j]
\end{aligned}
\right.
$$

## Make a String into a Palindrome

What's the smallest number of characters you have to add (not remove, mind) to string $$S$$ to make it a palindrome?

### Logic

Once again, we're comparing two elements of the string, so we need two iterators. Consider any substring from $$i$$ to $$j$$. Are the first and last characters the same ($$S[i] = S[j]$$)? Then we can just ignore them and move on to computing the result for the $$i+1$$ and $$j-1$$. Are the endpoints different? We imagine that we add an element to either end to *make* the endpoints match, then cut those off and recurse on the substring that's left. This means that `M` will be 1 (for the char we added) plus the min of `M` on $$[i+1:j]$$ and $$[i:j-1]$$.

### Recursion

$$
M[i, j] = \left\{\begin{aligned}
&M[i+1, j-1] &&: S[i] = S[j] \\
&1 + \min(M[i+1, j], M[i, j-1]) &&: S[i] \neq S[j]
\end{aligned}
\right.
$$

## Number of Ways to Write a Number as a Sum

This one's from Jaehyun Park's notes. Calculate the number of ways in which you can write a number $$n$$ as a sum of $$1$$, $$3$$, and $$4$$. Of course, $$1+4$$ and $$4+1$$ are the same sum.

### Logic

This is a "how can we form a subproblem from smaller subproblems" example. Consider a number $$i$$ and think about how we could've arrived at it from a smaller number. Either we got there by adding 1 to $$i-1$$, or by adding 3 to $$i-3$$, or by adding 4 to $$i-4$$. The number of ways we could've gotten to $$i$$, then, is the numbers of ways we could've gotten $$i-1$$ plus the same for $$i-3$$ plus the same for $$i-4$$.

You do, of course, have to hardcode `M` for $$0 \le i < 4$$.

### Recursion

$$
M[i] = M[i-1] + M[i-3] + M[i-4]
$$

## Floyd-Warshall Algorithm

Say we have an undirected weighted graph with vertices $$V$$ labeled $$1$$ through $$n$$, with the weight from vertex $$i$$ to vertex $$j$$ written as $$w_{ij}$$. (The weights are allowed to go negative as long as the graph doesn't have negative cycles.) Find the shortest path between each pair of vertices.

### Logic

As in the string problems above, we'll consider the $$i$$-to-$$j$$ path as a subproblem. However, we can't just call it a day here because, given the best $$i$$-$$j$$ path and a vertex outside the $$i$$-$$j$$ path, there's no $$O(1)$$ way to check how to connect the vertex to the path. So this necessitates an additional iterator.

We formulate the objective like this: the shortest path from $$i$$ to $$j$$ using only vertices in the $$[1,k]$$ range (in addition to $$i$$ and $$j$$). So at $$k=0$$, $$i$$'s shortest path to $$j$$ is just $$w_{ij}$$.

Then $$M[i, j, k]$$ is the length of a path that goes from $$i$$ to $$j$$ through some subset of the vertices $${1, \ldots, k}$$. What if we included vertex $$k+1$$? Then either the shortest $$i$$-to-$$j$$ path doesn't use $$k+1$$ or it goes from $$i$$ to $$k+1$$ to $$j$$, so $$M[i, j, k+1]$$ is the min of $$M[i, j, k]$$ and the weight of the path through $$k+1$$.

### Recursion

$$
M[i, j, k+1] = \min(M[i, j, k], M[i, k+1, k] + M[k+1, j, k])
$$

## Traveling Salesman

Also from Jaehyun Park's notes. Given a weighted graph of $$n$$ nodes numbered $$1$$ through $$n$$ with weights $$w_{ij}$$, find the shortest path that visits each node exactly once (AKA a Hamiltonian path).

### Logic

Say we have a Hamiltonian path covering subset $$S$$ of the nodes and ending on node $$j$$. This path has cost $$M[S, i]$$. The path got to node $$i$$ from some node $$s \in S$$, and the cost of the path till that point is $$M[S \setminus s, s]$$. So, at node $$i$$ we just minimize $$w_{is} + M[S \setminus s, s]$$ over all $$s \in S$$.

Note that this is still quite exponential - the first argument of `M` varies with every single combination of the $$n$$ vertices. Still beats the naive $$O(n!)$$ solution, though.

### Recursion

$$
M[S, i] = \min_{s \in S} (w_{is} + M[S \setminus s, s])
$$

Of course, $$M[\{i\}, i] = 0$$ because the graph consisting of $$i$$ has no cost.

## Longest Increasing Subsequence

You have an array $$[v_1, \ldots, v_n]$$. Find the length of the longest increasing subsequence (LIS).

### Logic

`M` is, as always, the objective - the length of the LIS ending on the term at index $$i$$. Take the last term in the $$[v_1, \ldots, v_i]$$ subarray. What's the longest subsequence that ends with that term? It's 1 plus the maximal $$M[j]$$ for $$j$$ in the $$[0, \ldots, i-1]$$ interval such that $$v_j<v_i$$.

### Recursion

$$
M[i] = 1 + \max_{j : j<i, v_j<v_i} M[j]
$$

As stated, we do need to find every $$j$$ such that $$v_j<v_i$$. This makes the algorithm $$O(n^2)$$. We can turn this into $$O(n \log n)$$ if we store predecessor information (see the <a href="https://en.wikipedia.org/wiki/Longest_increasing_subsequence">Wikipedia article</a>).

## References

<a href="https://cw.fel.cvut.cz/wiki/_media/courses/ae4m33bia/dp_examples.pdf">DP Examples</a>

<a href="https://www.cs.cmu.edu/~avrim/451f09/lectures/lect1001.pdf">DP Lecture from CMU</a>

<a href="https://web.stanford.edu/class/cs97si/04-dynamic-programming.pdf">Jaehyun Park's lecture notes from Stanford</a>

<a href="https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm">Floyd-Warshall algo on Wikipedia</a>
