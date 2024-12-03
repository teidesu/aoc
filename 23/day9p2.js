/*
## \ Part Two

Of course, it would be nice to have _even more history_ included in your report. Surely it's safe to just _extrapolate
backwards_ as well, right?

For each history, repeat the process of finding differences until the sequence of differences is entirely zero. Then,
rather than adding a zero to the end and filling in the next values of each previous sequence, you should instead add a
zero to the _beginning_ of your sequence of zeroes, then fill in new _first_ values for each previous sequence.

In particular, here is what the third example history looks like when extrapolating back in time:

```
_5_  10  13  16  21  30  45
  _5_   3   3   5   9  15
   _-2_   0   2   4   6
      _2_   2   2   2
        _0_   0   0
```
Adding the new values on the left side of each sequence from bottom to top eventually reveals the new left-most history
value: `_5_`.

Doing this for the remaining example data above results in previous values of `_-3_` for the first history and `_0_` for
the second history. Adding all three new values together produces `_2_`.

Analyze your OASIS report again, this time extrapolating the _previous_ value for each history. _What is the sum of
these extrapolated values?_
*/

import { magic, pairDiffs, readFileReader } from '../utils/index.js'

magic()

const lines = readFileReader('data/day9.txt')
const nums = lines.map(line => line.numbers())

function extrapolate(nums) {
    let current = nums
    const history = [current]
    while (true) {
        const diffs = pairDiffs(current)

        current = diffs
        history.push(diffs)

        if (diffs.every(n => n === 0)) {
            break
        }
    }

    // console.log(history.map(it => it.join(' ')).join('\n'))

    let last = history[history.length - 1]
    last.unshift(0)

    for (const it of history.reverse()) {
        it.unshift(it[0] - last[0])
        last = it
        // console.log(it)
    }

    return last[0]
}

let sum = 0

for (const n of nums) {
    sum += extrapolate(n)
}

console.log(sum)
