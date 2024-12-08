/*
## \ Part Two

Watching over your shoulder as you work, one of The Historians asks if you took the effects of resonant harmonics into
your calculations.

Whoops!

After updating your model, it turns out that an antinode occurs at _any grid position_ exactly in line with at least two
antennas of the same frequency, regardless of distance. This means that some of the new antinodes will occur at the
position of each antenna (unless that antenna is the only one of its frequency).

So, these three `T`\-frequency antennas now create many antinodes:

```
T....#....
...T......
.T....#...
.........#
..#.......
..........
...#......
..........
....#.....
..........
```
In fact, the three `T`\-frequency antennas are all exactly in line with two antennas, so they are all also antinodes!
This brings the total number of antinodes in the above example to `_9_`.

The original example now has `_34_` antinodes, including the antinodes that appear on every antenna:

```
##....#....#
.#.#....0...
..#.#0....#.
..##...0....
....0....#..
.#...#A....#
...#..#.....
#....#.#....
..#.....A...
....#....A..
.#........#.
...#......##
```
Calculate the impact of the signal using this updated model. _How many unique locations within the bounds of the map
contain an antinode?_
*/

import type { GridCursor } from '../utils/index.js'
import { combinations, Grid, readFileAsMatrix } from '../utils/index.js'

const lines = readFileAsMatrix('data/day8.txt')
const grid = new Grid(lines)

const locations = new Set<string>()

const antennasByFrequency = new Map<string, GridCursor<string>[]>()

for (const cursor of grid) {
    if (cursor.value !== '.') {
        const frequency = cursor.value
        const antennas = antennasByFrequency.get(frequency) ?? []
        antennas.push(cursor)
        antennasByFrequency.set(frequency, antennas)
    }
}

for (const [, antennas] of antennasByFrequency) {
    for (const [a, b] of combinations(antennas, 2)) {
        if (a.x === b.x && a.y === b.y) {
            continue
        }

        const dx = a.x - b.x
        const dy = a.y - b.y

        let cur = a.offset(dx, dy)
        while (!cur.empty) {
            cur.value = '#'
            locations.add(cur.key)

            cur = cur.offset(dx, dy)
        }

        locations.add(a.key)
    }
}

console.log(locations.size)
