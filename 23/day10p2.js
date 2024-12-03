/*
## \ Part Two

You quickly reach the farthest point of the loop, but the animal never emerges. Maybe its nest is _within the area
enclosed by the loop_?

To determine whether it's even worth taking the time to search for such a nest, you should calculate how many tiles are
contained within the loop. For example:

```
...........
.S-------7.
.|F-----7|.
.||.....||.
.||.....||.
.|L-7.F-J|.
.|..|.|..|.
.L--J.L--J.
...........
```
The above loop encloses merely _four tiles_ - the two pairs of `.` in the southwest and southeast (marked `I` below).
The middle `.` tiles (marked `O` below) are _not_ in the loop. Here is the same loop again with those regions marked:

```
...........
.S-------7.
.|F-----7|.
.||_OOOOO_||.
.||_OOOOO_||.
.|L-7_O_F-J|.
.|_II_|_O_|_II_|.
.L--J_O_L--J.
....._O_.....
```
In fact, there doesn't even need to be a full tile path to the outside for tiles to count as outside the loop -
squeezing between pipes is also allowed! Here, `I` is still within the loop and `O` is still outside the loop:

```
..........
.S------7.
.|F----7|.
.||_OOOO_||.
.||_OOOO_||.
.|L-7F-J|.
.|_II_||_II_|.
.L--JL--J.
..........
```
In both of the above examples, `_4_` tiles are enclosed by the loop.

Here's a larger example:

```
.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...
```
The above sketch has many random bits of ground, some of which are in the loop (`I`) and some of which are outside it
(`O`):

```
_O_F----7F7F7F7F-7_OOOO_
_O_|F--7||||||||FJ_OOOO_
_O_||_O_FJ||||||||L7_OOOO_
FJL7L7LJLJ||LJ_I_L-7_OO_
L--J_O_L7_III_LJS7F-7L7_O_
_OOOO_F-J_II_F7FJ|L7L7L7
_OOOO_L7_I_F7||L7|_I_L7L7|
_OOOOO_|FJLJ|FJ|F7|_O_LJ
_OOOO_FJL-7_O_||_O_||||_OOO_
_OOOO_L---J_O_LJ_O_LJLJ_OOO_
```
In this larger example, `_8_` tiles are enclosed by the loop.

Any tile that isn't part of the main loop can count as being enclosed by the loop. Here's another example with many bits
of junk pipe lying around that aren't connected to the main loop at all:

```
FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L
```
Here are just the tiles that are _enclosed by the loop_ marked with `I`:

```
FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ_I_F7FJ-
L---JF-JLJ_IIII_FJLJJ7
|F|F-JF---7_III_L7L|7|
|FFJF7L7F-JF7_II_L---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L
```
In this last example, `_10_` tiles are enclosed by the loop.

Figure out whether you have time to search for the nest by calculating the area within the loop. _How many tiles are
enclosed by the loop?_
*/

import { Grid, magic, readFileAsMatrix } from '../utils/index.js'

magic()

const mat = readFileAsMatrix('data/day10.txt')
const grid = new Grid(mat)

const start = grid.find(c => c.value === 'S')

// expand the map

const expands = {
    'L': [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    'J': [
        [0, 1, 0],
        [1, 1, 0],
        [0, 0, 0],
    ],
    '7': [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
    ],
    'F': [
        [0, 0, 0],
        [0, 1, 1],
        [0, 1, 0],
    ],
    '-': [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    '|': [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
    ],
    'S': [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ],
}

const expanded = Grid.create(grid.width * 3, grid.height * 3)

for (const cursor of grid) {
    const x = cursor.x * 3
    const y = cursor.y * 3

    if (cursor.value === '.') continue

    const expandedValue = expands[cursor.value]
    if (!expandedValue) console.log(cursor)

    expanded.setFrom(expandedValue, x, y)
}

// connect S
const startCur = expanded.cursor(start.x * 3 + 1, start.y * 3 + 1)

for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
        if (dx === dy) continue

        if (startCur.offset(dx * 2, dy * 2).value === 1) {
            startCur.offset(dx, dy).value = 1
        }
    }
}

// traverse the path
const path = new Set([startCur.key])
let cur = startCur

while (true) {
    const next = cur.crossNeighbors.find(n => n.value === 1 && !path.has(n.key))
    if (!next) {
        break
    }

    path.add(next.key)
    cur = next
}

// set everything except path to 0
for (const cursor of expanded) {
    if (cursor.value === 1 && !path.has(cursor.key)) {
        cursor.value = 0
    }
}

// flood fill
expanded.floodFill({ value: () => 2 })

// find tiles that are not filled
let count = 0
for (const tile of expanded.tiles(3, 3)) {
    if (tile.find(v => v.value === 2)) continue
    count++
}

console.log(count)
