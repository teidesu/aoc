/*
## \ Day 10: Pipe Maze

You use the hang glider to ride the hot air from Desert Island all the way up to the floating metal island. This island
is surprisingly cold and there definitely aren't any thermals to glide on, so you leave your hang glider behind.

You wander around for a while, but you don't find any people or animals. However, you do occasionally find signposts
labeled "[Hot Springs](https://en.wikipedia.org/wiki/Hot_spring)" pointing in a seemingly consistent direction; maybe
you can find someone at the hot springs and ask them where the desert-machine parts are made.

The landscape here is alien; even the flowers and trees are made of metal. As you stop to admire some metal grass, you
notice something metallic scurry away in your peripheral vision and jump into a big pipe! It didn't look like any animal
you've ever seen; if you want a better look, you'll need to get ahead of it.

Scanning the area, you discover that the entire field you're standing on is densely packed with pipes; it was hard to
tell at first because they're the same metallic silver color as the "ground". You make a quick sketch of all of the
surface pipes you can see (your puzzle input).

The pipes are arranged in a two-dimensional grid of _tiles_:

*   `|` is a _vertical pipe_ connecting north and south.
*   `-` is a _horizontal pipe_ connecting east and west.
*   `L` is a _90-degree bend_ connecting north and east.
*   `J` is a _90-degree bend_ connecting north and west.
*   `7` is a _90-degree bend_ connecting south and west.
*   `F` is a _90-degree bend_ connecting south and east.
*   `.` is _ground_; there is no pipe in this tile.
*   `S` is the _starting position_ of the animal; there is a pipe on this tile, but your sketch doesn't show what shape the pipe has.

Based on the acoustics of the animal's scurrying, you're confident the pipe that contains the animal is _one large,
continuous loop_.

For example, here is a square loop of pipe:

```
.....
.F-7.
.|.|.
.L-J.
.....
```
If the animal had entered this loop in the northwest corner, the sketch would instead look like this:

```
.....
._S_-7.
.|.|.
.L-J.
.....
```
In the above diagram, the `S` tile is still a 90-degree `F` bend: you can tell because of how the adjacent pipes connect
to it.

Unfortunately, there are also many pipes that _aren't connected to the loop_! This sketch shows the same loop as above:

```
-L|F7
7S-7|
L|7||
-L-J|
L|-JF
```
In the above diagram, you can still figure out which pipes form the main loop: they're the ones connected to `S`, pipes
those pipes connect to, pipes _those_ pipes connect to, and so on. Every pipe in the main loop connects to its two
neighbors (including `S`, which will have exactly two pipes connecting to it, and which is assumed to connect back to
those two pipes).

Here is a sketch that contains a slightly more complex main loop:

```
..F7.
.FJ|.
SJ.L7
|F--J
LJ...
```
Here's the same example sketch with the extra, non-main-loop pipe tiles also shown:

```
7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ
```
If you want to _get out ahead of the animal_, you should find the tile in the loop that is _farthest_ from the starting
position. Because the animal is in the pipe, it doesn't make sense to measure this by direct distance. Instead, you need
to find the tile that would take the longest number of steps _along the loop_ to reach from the starting point -
regardless of which way around the loop the animal went.

In the first example with the square loop:

```
.....
.S-7.
.|.|.
.L-J.
.....
```
You can count the distance each tile in the loop is from the starting point like this:

```
.....
.012.
.1.3.
.23_4_.
.....
```
In this example, the farthest point from the start is `_4_` steps away.

Here's the more complex loop again:

```
..F7.
.FJ|.
SJ.L7
|F--J
LJ...
```
Here are the distances for each tile on that loop:

```
..45.
.236.
01.7_8_
14567
23...
```
Find the single giant loop starting at `S`. _How many steps along the loop does it take to get from the starting
position to the point farthest from the starting position?_
*/

import { Grid, magic, readFileAsMatrix } from '../utils/index.js'

magic()

const mat = readFileAsMatrix('data/day10.txt')
const grid = new Grid(mat)

const start = grid.find(c => c.value === 'S')

const connections = {
    '|': ['up', 'down'],
    '-': ['left', 'right'],
    'L': ['up', 'right'],
    'J': ['up', 'left'],
    '7': ['down', 'left'],
    'F': ['down', 'right'],
    'S': ['up', 'down', 'left', 'right'],
    '.': [],
}
const connectionsNext = {
    up: '7|F',
    down: 'J|L',
    left: 'F-L',
    right: 'J-7',
}

function detectPossibleDirections(cur) {
    const possible = []

    for (const conn of connections[cur.value]) {
        if (connectionsNext[conn].includes(cur[conn].value)) {
            possible.push(conn)
        }
    }

    return possible
}

const directions = detectPossibleDirections(start)
if (directions.length !== 2) {
    throw new Error('Invalid start')
}

function followPath(start, direction) {
    const path = new Set([start.key])
    let pathSize = 1
    let cur = start

    while (true) {
        const next = cur[direction]
        if (path.has(next.key)) {
            break
        }
        path.add(next.key)
        cur = next

        const nextDirections = detectPossibleDirections(cur)
        if (!nextDirections.length || nextDirections.length > 2) {
            throw new Error(`Invalid path: ${cur}`)
        }

        // go where we haven't been yet
        direction = nextDirections.find(d => !path.has(cur[d].key))
        if (!direction) break

        pathSize++
    }

    return pathSize
}

const path1 = followPath(start, directions[0])

console.log(path1 / 2)
