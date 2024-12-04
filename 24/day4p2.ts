/*
## \ Part Two

The Elf looks quizzically at you. Did you misunderstand the assignment?

Looking for the instructions, you flip over the word search to find that this isn't actually an `_XMAS_` puzzle; it's an
`_X-MAS_` puzzle in which you're supposed to find two `MAS` in the shape of an `X`. One way to achieve that is like
this:

```
M.S
.A.
M.S
```
Irrelevant characters have again been replaced with `.` in the above diagram. Within the `X`, each `MAS` can be written
forwards or backwards.

Here's the same example from before, but this time all of the `X-MAS`es have been kept instead:

```
.M.S......
..A..MSMS.
.M.S.MAA..
..A.ASMSM.
.M.S.M....
..........
S.S.S.S.S.
.A.A.A.A..
M.M.M.M.M.
..........
```
In this example, an `X-MAS` appears `_9_` times.

Flip the word search from the instructions back over to the word search side and try again. _How many times does an
`X-MAS` appear?_
*/

import { Grid, readFileAsMatrix } from '../utils/index.js'

const lines = readFileAsMatrix('data/day4.txt')
const grid = new Grid(lines)

let count = 0

for (const cur of grid) {
    const chunk = cur.areaToOffset(2, 2)

    const str = [
        chunk.get(0, 0),
        chunk.get(0, 2),
        chunk.get(1, 1),
        chunk.get(2, 0),
        chunk.get(2, 2),
    ].join('')

    if (str.length !== 5) continue
    if (str[2] !== 'A') continue

    if ([
        'MMASS',
        'MSAMS',
        'SMASM',
        'SSAMM',
    ].includes(str)) {
        count++
    }
}

console.log(count)

// a slightly more readable solution that i made after the initial one

count = 0

for (const cur of grid) {
    if (
        ['MAS', 'SAM'].includes(cur.ray(2, 2).join(''))
        && ['MAS', 'SAM'].includes(cur.offset(0, 2).ray(2, -2).join(''))
    ) {
        count++
    }
}

console.log(count)
