import { Grid, readFileAsMatrix } from '../utils/index.js'

const data = readFileAsMatrix('data/day3.txt')
const grid = new Grid(data)

const numbers = []
const symbols = []

for (let it = grid.cursor(0, 0); it.hasNext(); it = it.next()) {
    const start = it
    while (!it.empty && it.value.match(/\d/)) {
        it = it.right
    }

    if (!start.eq(it)) {
        const num = start.areaTo(it.left)
        numbers.push(num)
    }

    if (it.empty) continue

    if (it.value !== '.') {
        symbols.push(it)
    }
}

let sum = 0
for (const num of numbers) {
    for (const sym of symbols) {
        if (sym.isAdjacentTo(num)) {
            sum += Number(num.asStringLtr())
        }
    }
}

console.log(sum)
