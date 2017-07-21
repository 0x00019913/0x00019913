---
layout: post
title: "Minesweeper Implementation"
author: "0x00019913"
mathjax: true
excerpt: "An unsurprisingly brief post about how Minesweeper works internally."
date: 2017-07-20 22:56:00
---

In my tens of thousands of games (no, seriously) of Win 7 Minesweeper, I worked out lots of patterns but never considered how the game actually works. <a href="https://0x00019913.github.io/tnms/">A self-imposed AngularJS exercise later</a>, I've formalized the (very simple) behaviors of the game, as detailed below.

## Game Setup

First, some setup. TLDR: open those and only those cells that do not contain a mine.

<div class="img-box">
  <img src="/assets/img/msgame.jpg" />
  <div class="img-caption">A minesweeper board with a game in progress.</div>
</div>

The Minesweeper board is an `H`-by-`W` array of cells. Each cell starts out closed. Beneath an unknown subset of these cells are hidden `N` mines.

When a player clicks a closed cell, it opens and one of the following occurs:

- If the cell contains a mine, the game is lost.
- If the cell is adjacent to `n` mines, the cell opens and contains the number `n`.
- If the cell is empty (neither contains nor borders mines), it opens and opens its neighbors recursively.

The following click behaviors are supported:

- Left-click a closed cell: the cell opens.
- Right-click a closed cell: toggles the cell flag. While the cell is flagged, left-clicking it does nothing.
- Hold both mouse buttons and release one of them on an open number cell: if the cell displays `n` and borders exactly `n` flagged cells, its unflagged neighbors are recursively opened.

The end conditions are:

- The player clicks a mine: the game ends and allows no further interaction, save for restarting the game.
- The player opens every cell that does not contain a mine: this wins the game.
- The player resets the game.

## Opening Cells

One of the two interesting parts of this is the algorithm to open cells. It turns out to be nothing more than this:

- If the cell is a mine, lose.
- If the cell is a number cell, just reveal that cell.
- If the cell is empty, it borders no mines. That means it's safe to open all of its neighbors. If any of its neighbors are empty, open them too, recursively. If the cell is a number cell, just open that one - it will be guaranteed mine-free.

This way, when clicking an empty cell, we end up doing a depth-first search and propagating the opening method through the island of adjacent empty cells.

## Generating the Board

This is also simple. For each one of the `N` mines, do the loop:

- Generate two random coordinates into the board.
- If the coords are already on a mine, generate a new pair.
- Repeat till you hit a free cell.

Of course, since we're poking the board randomly, this could run for a long time. But, if the total number of cells in the board (`H*W`) is substantially greater than the number of mines (e.g., the standard "advanced" board is 30x16 = 480 with 99 mines), then you're very unlikely to get too many conflicts.

## Additional Considerations

1. Some less fancy implementations of Minesweeper just generate a board and let the player start. The problem is, the player might land on a mine right away and that's annoying. So you can wait to generate the board (a cheap process) until the user's first click and then make sure that there's no mine there. And, to be nice, make sure there are no mines within a 3x3 square of the click location.

2. As mentioned above, the click-two-buttons-on-a-number behavior is very nice to have for a faster player. It's also nice to have double click trigger the same behavior.

<div class="img-box">
  <img src="/assets/img/mswin.jpg" />
  <div class="img-caption">Victory!</div>
</div>
