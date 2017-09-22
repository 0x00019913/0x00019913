---
layout: post
title: "Some Random Problems From the Internet"
author: "0x00019913"
mathjax: true
excerpt: "Solved interview-type problems whose solutions I found interestingly hard or interestingly easy."
date: 2017-09-21 18:29:00
hidden: 0
---

* TOC
{:toc}

I'll write everything in Python for easy reading, but the code will translate directly into other common imperative languages. As Knuth admittedly overstated,

> “Programs are meant to be read by humans and only incidentally for computers to execute.”

## Maximum Sum Subarray

Given an array of `int`s, find the contiguous subarray with the largest sum and return that sum.

Example: in `[-1,-3,2,-1,4,1,-1,2]`, the largest-sum subarray is `[2,-1,4,1]` with a sum of `7`.

### Solution

Obviously doable in `O(n^2)` time, but there's a linear-time solution. I'm told this is called "Kadane's algorithm".

{% highlight python linenos %}
def maxContiguousSum(a):
    # running sum of the subarray ending here
    sumtohere = a[0]
    # largest sum seen so far
    maxsum = a[0]

    # sums are set to the first element; iterate over the rest
    for i in xrange(1,len(a)):
        # try adding a[i] to the running sum; if a[i] is alone greater
        # than the result, set the running sum just to a[i]
        sumtohere = max(a[i], sumtohere + a[i])

        # update max sum seen so far
        maxsum = max(maxsum, sumtohere)

    return maxsum
{% endhighlight %}

### Rationale

When we're at a particular index `i` in array `a`, we know the largest-sum subarray ending at `i-1`. Let's add `a[i]` to the result. If `a[i]` alone is greater than the resulting sum, then the greatest-sum subarray ending at `i` might as well consist of just `a[i]`. Then we update the maximum sum seen so far. Repeat for the rest of the array.

## Find the Start of the Cycle in a Linked List

A node in a singly linked list is defined thusly:

{% highlight python linenos %}
class node(object):
   def __init__(self, x):
       self.val = x
       self.next = None
{% endhighlight %}

Detect if the linked list contains a cycle and find its start; return null if no cycle.

### Solution

{% highlight python linenos %}
def findCycle(head):
    # set up our slow and fast pointers
    slow = head
    fast = head

    # fast moves more quickly than slow; if there's a null pointer,
    # fast will find it first
    while fast:
        # if fast is about to hit the end, there's no cycle
        if fast.next is None:
            return None

        # advance the pointers
        slow = slow.next
        fast = fast.next.next

        # break when slow and fast have met
        if slow==fast:
            break

    # return null if fast has run off the end, or if head was null
    # to start with
    if fast is None:
        return None

    # start a pointer at the head, advance it evenly with either
    # pointer till they meet; *the reason this works is not intuitive*
    tmp = head
    while slow != tmp:
        slow = slow.next
        tmp = tmp.next

    # slow is now at the start of the cycle
    return slow
{% endhighlight %}

### Rationale

Make two pointers: `slow` going forward by one step each iteration, `fast` going by two steps. Launch the pointers; if there is a cycle, they will eventually meet at the same node. Then start a pointer from the head and advance it and `slow` by one step each until they meet. This is the start of the cycle.

#### ...why does it work, though?

Say we have `m` nodes before the cycle starts, the cycle is `n` nodes long, and the two nodes meet at `k` nodes into the cycle. By the time they meet, `slow` will have traveled `i` steps and `fast` will have traveled `2i` steps. I hope the above is agreeable.

So now we have this: `slow` will travel `i = m + p*n + k` steps and `fast` will travel `2i = m + q*n + k` steps: the initial `m` steps to the cycle, `k` steps into the cycle, and some number of `n`-node loops around the cycle.

Subtracting, `i = (q-p)*n`, so both pointers travel some multiple of `n` total steps. But any multiple of `n` around the loop just puts you back at the same place, so both pointers meet at `n` nodes from the head of the list. This means that it's another `m` nodes from the meeting point to the cycle start because there are a total of `m+n` nodes.

So, since we know that `slow` is positioned `m` nodes before the cycle start, and `head` is also `m` nodes from the cycle start, just move the two evenly forward till they both end up at the cycle start.

## Maximum Sum of Non-Adjacent Array Entries

<a href="https://leetcode.com/problems/house-robber/">(This LeetCode problem.)</a>

Say you have an array of `int`s and you're only allowed to pick non-adjacent entries. What's the maximum sum of those you can pick?

### Solution

This is simple dynamic programming; constant space, linear time.

{% highlight python linenos %}
def nonAdjacentSum(a):
    # maximum sum up to two entries back
    prevprev = 0
    # maximum sum up to the previous entry
    prev = 0

    # iterate through the array
    for i in xrange(len(a)):
        tmp = prev
        prev = max(a[i] + prevprev, prev)
        prevprev = tmp

    return prev
{% endhighlight %}

### Rationale

Suppose you're iterating through the array and you're at index `i`. Say you know the maximum attainable sum for the previous indices. Then you can either take `a[i]` or not take it:

If you take `a[i]`, you can't take `a[i-1]`, so the most you can get is `a[i]` plus the maximum attainable up to and including `i-2`.

If you don't take `a[i]`, you can get the maximum attainble up to and including `i-1`.

So you just need to know the max for the previous two entries.

## Maximum Sum of Non-Child Binary Tree Nodes

<a href="https://leetcode.com/problems/house-robber-iii/">(This LeetCode problem.)</a>

Similar setup, and surprisingly easy to solve: you have the root of a binary tree and you want to maximize the sum of the nodes you pick, but you can't pick a pair of nodes such that one is the other's immediate descendant.

The tree nodes are defined like so:

{% highlight python linenos %}
class node(object):
   def __init__(self, x):
       self.val = x
       self.left = None
       self.right = None
{% endhighlight %}

### Solution

Python tuples are reeeeeeally nice for this kind of function.

{% highlight python linenos %}
# returns a tuple (a,b)
# a is the max gain if we picked the given node
# b is the max gain if we picked not it but a descendant
def maxgain(root):
    # if root is null, we gain 0 from it and its descendants
    if root is None:
        return (0, 0)

    # max gain from the left child and from its descendants
    l,ld = self.maxgain(root.left)
    # max gain fromt he right child and from its descendants
    r,rd = self.maxgain(root.right)

    return (root.val + ld + rd, max(l, ld) + max(r, rd))

def nonChildSum(root):
    # the max of picking the root or its descendants
    return max(self.maxgain(root))
{% endhighlight %}

### Rationale

So that's looking pretty opaque.

Suppose you're at the root of some subtree in this tree. We need to decide whether to take this node's value into our sum or not. Say we have a function that tells us the max gain from picking its children, and the max gain from not picking its children but some of their descendants. Let's go through the cases:

If we pick the current node, we can't pick either of its children. So the max gain from picking the root is its value plus the total max gain from its children's descendants.

If we don't pick the root node, we can take something from either the children or from their descendants. So we add the max attainable from the left/right children.

And that's the recurrence.

## Find All Numbers Missing in an Unsorted 1-n Array

This is probably the weirdest solution here; the method to solve this problem struck me as esoteric and took me a while to grok.

Suppose you have an array `a` of length `n` containing some of the numbers such that `1 <= a[i] <= n`. Some numbers are repeated, so some are missing. Find the missing numbers.

### Solution

Linear runtime and constant space, interestingly.

{% highlight python linenos %}
def findMissingNumbers(a):
    result = []
    n = len(a)
    i = 0
    # sort the array
    while i<n:
        # if the entry at a[i] doesn't match the sorted order...
        if a[a[i]-1]!=a[i]:
            # ... swap a[i] and a[a[i]-1]
            tmp = a[i]
            a[i] = a[a[i]-1]
            a[tmp-1] = tmp
        else:
            i += 1

    # sorted array should contain i+1 at index i; if it doesn't,
    # then the number i+1 is missing
    for i in xrange(n):
        if a[i]!=i+1:
            result.append(i+1)
    return result
{% endhighlight %}

### Rationale

So it turns out that certain arrays can be sorted in-place in linear time - specifically arrays of length `n` bound to the `[1,n]` range. That's what the `while` loop is doing.

It works like this. `a[i]` should equal `i+1` if the array is sorted and has no duplicates, so each member will contain its own index (plus 1). Else, it'll point to some other member, which might point to some other member, etc.

Say `a[0] = 5`, `a[4] = 7`, `a[6] = 1`. Start with `i = 0`.

Iteration 1: `i = 0`, `a[i] = 5`, `a[a[i]-1] = 7`. These are not equal, so we need to swap `a[i]` and `a[a[i]-1]`. So now `a[0] = 7`, `a[4] = 5`, `a[6] = 1`; thus `a[4]` now points to the correct index.

Iteration 2: `i = 0`, `a[i] = 7`, `a[a[i]-1] = 1`. These are still not equal, so swap. Now `a[0] = 1` and `a[6] = 7`, just as a sorted array should have. Moreover, the value at position `0` is correct, so we can move on to index `1`.

Now consider the case of duplicates: e.g., `a[0] = 5` and `a[4] = 5`. Then the equality condition passes, we accept that we can't fix index `0` right now, and we just skip over `i = 0`. If some later index `i` contains `1`, we'll swap from that index.

After sorting, every index `i` will contain `i+1` if `i+1` is present; else it'll contain some duplicate. Iterate a second time and record the `i+1` if index `i` contains something different.

## Check if a Tree Is a BST

I once gloriously failed this question in an on-site interview at a prominent tech company, so I had to go and understand the problem inside and out. :P

A binary search tree is a tree such that, for any subtree, the left subtree only contains values *less* than the value of the root and the right subtree only contains values *greater* than the value of the root. You can define it however you want regarding equality of nodes.

The problem: given the root of a tree, validate that a tree is a BST.

### Solution

This is a very nice pattern I saw in a post by user <a href="https://discuss.leetcode.com/user/issac3">issac3</a> on LeetCode, so I thought I'd write it up. Also, <a href="https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search">Wikipedia lists the different DFS tree traversal methods</a> in a very understandable format.

{% highlight python linenos %}
# uses in-order traversal, which will navigate a BST in the
# correct numerical order
def checkBST(root):
    stack = []
    # prev should be be the previous node seen when navigating
    # a BST in numerical order
    prev = None

    # while root isn't null, we have more nodes to check;
    # while stack isn't empty, we have more nodes to check
    while root or len(stack)>0:
        # go as far left as we can; push every node to the stack
        while root:
            stack.append(root)
            root = root.left

        # root is null; get the last node we pushed to the stack
        root = stack.pop()
        # check if it's indeed greater than the previous value
        if prev and prev.val>=root.val:
            return False
        prev = root

        # the current root still has a right child; go to that
        # and continue
        root = root.right

    return True
{% endhighlight %}

### Rationale

One is often tempted to do recursive solutions for tree-related problems, but I prefer this iterative in-order traversal pattern, at least for this particular problem, because

1. there's no finicky `INT_MAX` stuff involved and
2. the recursive solution makes stack frames instead of a local stack, and stack frames are more expensive.

So does it work? We want the smallest-value node in a BST, which, by definition, would be the leftmost node. So we traverse left as far as possible, keeping track of which nodes we've seen.
So the last node we see is the smallest. Does it have a right child? If so, its values must be less than the node's parent, so we need to go to the right child and identically seek the lowest node there. Rinse and repeat, and we get an in-order traversal.
