/*
## \ Part Two

The galaxies are much _older_ (and thus much _farther apart_) than the researcher initially estimated.

Now, instead of the expansion you did before, make each empty row or column _one million times_ larger. That is, each
empty row should be replaced with `1000000` empty rows, and each empty column should be replaced with `1000000` empty
columns.

(In the example above, if each empty row or column were merely `10` times larger, the sum of the shortest paths between
every pair of galaxies would be `_1030_`. If each empty row or column were merely `100` times larger, the sum of the
shortest paths between every pair of galaxies would be `_8410_`. However, your universe will need to expand far beyond
these values.)

Starting with the same initial image, expand the universe according to these new rules, then find the length of the
shortest path between every pair of galaxies. _What is the sum of these lengths?_
*/

import { fp, Grid, magic, readFileAsMatrix } from '../utils/index.js'

magic()

const lines = readFileAsMatrix('data/day11.txt')
const grid = new Grid(lines)

const EXPAND_BY = 1000000 - 1

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
