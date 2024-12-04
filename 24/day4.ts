/*
## \ Day 4: Ceres Search

"Looks like the Chief's not here. Next!" One of The Historians pulls out a device and pushes the only button on it.
After a brief flash, you recognize the interior of the [Ceres monitoring station](/2019/day/10)!

As the search for the Chief continues, a small Elf who lives on the station tugs on your shirt; she'd like to know if
you could help her with her _word search_ (your puzzle input). She only has to find one word: `XMAS`.

This word search allows words to be horizontal, vertical, diagonal, written backwards, or even overlapping other words.
It's a little unusual, though, as you don't merely need to find one instance of `XMAS` - you need to find _all of them_.
Here are a few ways `XMAS` might appear, where irrelevant characters have been replaced with `.`:

```
..X...
.SAMX.
.A..A.
XMAS.S
.X....
```
The actual word search will be full of letters instead. For example:

```
MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX
```
In this word search, `XMAS` occurs a total of `_18_` times; here's the same word search again, but where letters not
involved in any `XMAS` have been replaced with `.`:

```
....XXMAS.
.SAMXMS...
...S..A...
..A.A.MS.X
XMASAMX.MM
X.....XA.A
S.S.S.S.SS
.A.A.A.A.A
..M.M.M.MM
.X.X.XMASX
```
Take a look at the little Elf's word search. _How many times does `XMAS` appear?_
*/

import { Grid, readFileAsMatrix } from '../utils/index.js'

const lines = readFileAsMatrix('data/day4.txt')
const grid = new Grid(lines)

let count = 0

for (const cur of grid) {
    if (cur.value !== 'X') continue

    if (
        cur.right.value === 'M'
        && cur.right.right.value === 'A'
        && cur.right.right.right.value === 'S'
    ) {
        count++
    }

    if (
        cur.down.value === 'M'
        && cur.down.down.value === 'A'
        && cur.down.down.down.value === 'S'
    ) {
        count++
    }

    if (
        cur.left.value === 'M'
        && cur.left.left.value === 'A'
        && cur.left.left.left.value === 'S'
    ) {
        count++
    }

    if (
        cur.up.value === 'M'
        && cur.up.up.value === 'A'
        && cur.up.up.up.value === 'S'
    ) {
        count++
    }

    // diagonals

    if (
        cur.right.up.value === 'M'
        && cur.right.up.right.up.value === 'A'
        && cur.right.up.right.up.right.up.value === 'S'
    ) {
        count++
    }

    if (
        cur.right.down.value === 'M'
        && cur.right.down.right.down.value === 'A'
        && cur.right.down.right.down.right.down.value === 'S'
    ) {
        count++
    }

    if (
        cur.down.left.value === 'M'
        && cur.down.left.down.left.value === 'A'
        && cur.down.left.down.left.down.left.value === 'S'
    ) {
        count++
    }

    if (
        cur.up.left.value === 'M'
        && cur.up.left.up.left.value === 'A'
        && cur.up.left.up.left.up.left.value === 'S'
    ) {
        count++
    }
}

console.log(count)

// a slightly more readable solution that i made after the initial one
count = 0

for (const cur of grid) {
    if (cur.value !== 'X') continue

    if (cur.ray(3, 0).join('') === 'XMAS') count++
    if (cur.ray(0, 3).join('') === 'XMAS') count++
    if (cur.ray(-3, 0).join('') === 'XMAS') count++
    if (cur.ray(0, -3).join('') === 'XMAS') count++

    if (cur.ray(3, 3).join('') === 'XMAS') count++
    if (cur.ray(-3, -3).join('') === 'XMAS') count++
    if (cur.ray(3, -3).join('') === 'XMAS') count++
    if (cur.ray(-3, 3).join('') === 'XMAS') count++
}

console.log(count)
