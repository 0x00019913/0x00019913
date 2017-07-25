---
layout: post
title: "Two Cents on Dynamic Programming"
author: "0x00019913"
mathjax: true
excerpt: "Some dynamic programming problems with explained solutions."
date: 2017-07-24 23:48:00
hidden: 0
---

Of the elementary topics in computer science, I've found dynamic programming to be the most infuriatingly difficult to intuit to my satisfaction. So here's a little compendium of standard-ish problems with brief explanations and explicit recursions. I'll use the symbol `M` to denote the optimal solution.

I also won't go into code nor write out how the top-down approach turns into bottom-up; it tends to be a comparatively direct conversion.

## But First...

The way to solve a dynamic programming problem seems to hinge, anticlimactically, on internalizing the thing everyone says to do: break the problem into smaller problems. I don't feel like this conclusion gives enough intuition to actually solve a problem, but it's presumably the core of the matter.

Often the reasoning will be of the form "let's take an arbitrary subset of the problem and figure out the ways we could've arrived at that subset from some smaller subset" (e.g., the knapsack problem or the domino tiling problem). The degrees of freedom in a problem are a determining factor: for instance, when finding the longest palindromic subsequence of a string, you have to match up pairs of characters and so end up closing in from both ends of the string; thus the optimum `M` is bivariate and the runtime ends up being $$O(n^2)$$.

Additionally, a repeating pattern (or perhaps even a defining feature) seems to be the task of finding a path through the problem that extremizes a quantity; this quantity is `M`. The result of the calculation will tell you the extremum but not the path, but you can trace it back by looking at the intermediate values of `M`.

## 0/1 Knapsack

We have an array of $$n$$ values $$\{v_1, \cdots, v_n\}$$ and an array of corresponding weights $$\{w_1, \cdots, w_n\}$$. The knapsack's weight capacity is $$W$$ and we'd like to pick items to put into the knapsack while maximizing the total value and not overfilling the knapsack.

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

The subproblems are the substrings of $$S$$, specifically $$S[i \cdots j]$$. `M` is the length of the palindromic subsequence.

Start from the ends of a particular substring. Are the two endpoints equal ($$S[i] = S[j]$$)? Then we might as well include those in whatever palindromic substring it contains, so `M` increases by 2 plus the length of the substring excluding its two endpoints. Are the endpoints not equal? Then `M` is the length of the LPS of the same substring minus one of its endpoints (take the max of the two choices).

### Recursion

$$
M[i, j] = \left\{\begin{aligned}
&2 + M[i+1, j-1] &&: S[i] = S[j] \\
&\max(M[i+1, j], M[i, j-1]) &&: S[i] \neq S[j]
\end{aligned}
\right.
$$

## Longest Common Subsequence

Probably the best-known DP problem.

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

(It's 4 in the morning right now, so I'll do a few more tomorrow. The internet is certainly not short on examples.)
