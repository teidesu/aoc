/*
## \ Day 11: Cosmic Expansion

You continue following signs for "Hot Springs" and eventually come across an
[observatory](https://en.wikipedia.org/wiki/Observatory). The Elf within turns out to be a researcher studying cosmic
expansion using the giant telescope here.

He doesn't know anything about the missing machine parts; he's only visiting for this research project. However, he
confirms that the hot springs are the next-closest area likely to have people; he'll even take you straight there once
he's done with today's observation analysis.

Maybe you can help him with the analysis to speed things up?

The researcher has collected a bunch of data and compiled the data into a single giant _image_ (your puzzle input). The
image includes _empty space_ (`.`) and _galaxies_ (`#`). For example:

```
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....
```
The researcher is trying to figure out the sum of the lengths of the _shortest path between every pair of galaxies_.
However, there's a catch: the universe expanded in the time it took the light from those galaxies to reach the
observatory.

Due to something involving gravitational effects, _only some space expands_. In fact, the result is that _any rows or
columns that contain no galaxies_ should all actually be twice as big.

In the above example, three columns and two rows contain no galaxies:

```
v  v  v
 ...#......
 .......#..
 #.........
>..........<
 ......#...
 .#........
 .........#
>..........<
 .......#..
 #...#.....
   ^  ^  ^
```
These rows and columns need to be _twice as big_; the result of cosmic expansion therefore looks like this:

```
....#........
.........#...
#............
.............
.............
........#....
.#...........
............#
.............
.............
.........#...
#....#.......
```
Equipped with this expanded universe, the shortest path between every pair of galaxies can be found. It can help to
assign every galaxy a unique number:

```
....1........
.........2...
3............
.............
.............
........4....
.5...........
............6
.............
.............
.........7...
8....9.......
```
In these 9 galaxies, there are _36 pairs_. Only count each pair once; order within the pair doesn't matter. For each
pair, find any shortest path between the two galaxies using only steps that move up, down, left, or right exactly one
`.` or `#` at a time. (The shortest path between two galaxies is allowed to pass through another galaxy.)

For example, here is one of the shortest paths between galaxies `5` and `9`:

```
....1........
.........2...
3............
.............
.............
........4....
.5...........
.##.........6
..##.........
...##........
....##...7...
8....9.......
```
This path has length `_9_` because it takes a minimum of _nine steps_ to get from galaxy `5` to galaxy `9` (the eight
locations marked `#` plus the step onto galaxy `9` itself). Here are some other example shortest path lengths:

*   Between galaxy `1` and galaxy `7`: 15
*   Between galaxy `3` and galaxy `6`: 17
*   Between galaxy `8` and galaxy `9`: 5

In this example, after expanding the universe, the sum of the shortest path between all 36 pairs of galaxies is `_374_`.

Expand the universe, then find the length of the shortest path between every pair of galaxies. _What is the sum of these
lengths?_
*/

import { fp, Grid, magic, readFileAsMatrix } from '../utils/index.js'

magic()

const lines = readFileAsMatrix('data/day11.txt')
const grid = new Grid(lines)

const EXPAND_BY = 1

// find what to expand

const rowsToExpand = []
const colsToExpand = []

for (let i = 0; i < grid.height; i++) {
    if (!grid.row(i).find(c => c.value === '#')) {
        rowsToExpand.push(i)
    }
}

for (let i = 0; i < grid.width; i++) {
    if (!grid.col(i).find(c => c.value === '#')) {
        colsToExpand.push(i)
    }
}

// find all galaxies
const galaxies = [...grid.findAll(c => c.value === '#')]

let sum = 0
for (const [a, b] of fp.combinations(galaxies, 2)) {
    if (a.eq(b)) continue

    const minX = Math.min(a.x, b.x)
    const maxX = Math.max(a.x, b.x)
    const minY = Math.min(a.y, b.y)
    const maxY = Math.max(a.y, b.y)

    const dx = (maxX - minX) + EXPAND_BY * (colsToExpand.filter(c => c >= minX && c <= maxX).length)
    const dy = (maxY - minY) + EXPAND_BY * (rowsToExpand.filter(c => c >= minY && c <= maxY).length)

    const dist = dx + dy

    sum += dist
}

console.log(sum)
