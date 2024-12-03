/*
## \ Part Two

As you scan through the corrupted memory, you notice that some of the conditional statements are also still intact. If
you handle some of the uncorrupted conditional statements in the program, you might be able to get an even more accurate
result.

There are two new instructions you'll need to handle:

*   The `do()` instruction _enables_ future `mul` instructions.
*   The `don't()` instruction _disables_ future `mul` instructions.

Only the _most recent_ `do()` or `don't()` instruction applies. At the beginning of the program, `mul` instructions are
_enabled_.

For example:

```
x_mul(2,4)_&mul[3,7]!^_don't()__mul(5,5)+mul(32,64](mul(11,8)un_do()_?_mul(8,5)_)
```
This corrupted memory is similar to the example from before, but this time the `mul(5,5)` and `mul(11,8)` instructions
are _disabled_ because there is a `don't()` instruction before them. The other `mul` instructions function normally,
including the one at the end that gets re-_enabled_ by a `do()` instruction.

This time, the sum of the results is `_48_` (`2*4 + 8*5`).

Handle the new instructions; _what do you get if you add up all of the results of just the enabled multiplications?_
*/

import { readFileEntirely, readFileReaderSingle } from '../utils/index.js'

// the initial solution i came up on the spot

const line = readFileEntirely('data/day3.txt')

let enableNext = true
let sum = 0
for (let i = 0; i < line.length; i++) {
    if (line.slice(i, i + 4) === 'mul(') {
        const match = line.slice(i).match(/^mul\((\d+),(\d+)\)/)
        if (!match) {
            continue
        }

        const [x, y] = match.slice(1)

        if (enableNext) {
            sum += Number(x) * Number(y)
        }
        i += match[0].length - 1
    } else if (line.slice(i, i + 4) === 'do()') {
        enableNext = true
        i += 3
    } else if (line.slice(i, i + 7) === "don't()") {
        enableNext = false
        i += 6
    }
}

console.log(sum)

// a slightly more readable solution that i made after the initial one
// (i forgot i even had that helper lol)
const r = readFileReaderSingle('data/day3.txt')

sum = 0
enableNext = true
while (r.hasMore) {
    let m
    if ((m = r.maybe(/^mul\((\d+),(\d+)\)/))) {
        const [x, y] = m.slice(1)
        if (enableNext) {
            sum += Number(x) * Number(y)
        }
    } else if (r.maybe('do()')) {
        enableNext = true
    } else if (r.maybe("don't()")) {
        enableNext = false
    } else {
        r.continue()
    }
}

console.log(sum)
