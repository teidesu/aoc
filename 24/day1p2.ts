/*
## \ Part Two

Your analysis only confirmed what everyone feared: the two lists of location IDs are indeed very different.

Or are they?

The Historians can't agree on which group made the mistakes _or_ how to read most of the Chief's handwriting, but in the
commotion you notice an interesting detail: a lot of location IDs appear in both lists! Maybe the other numbers aren't
location IDs at all but rather misinterpreted handwriting.

This time, you'll need to figure out exactly how often each number from the left list appears in the right list.
Calculate a total _similarity score_ by adding up each number in the left list after multiplying it by the number of
times that number appears in the right list.

Here are the same example lists again:

```
3   4
4   3
2   5
1   3
3   9
3   3
```
For these example lists, here is the process of finding the similarity score:

*   The first number in the left list is `3`. It appears in the right list three times, so the similarity score increases by `3 * 3 = _9_`.
*   The second number in the left list is `4`. It appears in the right list once, so the similarity score increases by `4 * 1 = _4_`.
*   The third number in the left list is `2`. It does not appear in the right list, so the similarity score does not increase (`2 * 0 = 0`).
*   The fourth number, `1`, also does not appear in the right list.
*   The fifth number, `3`, appears in the right list three times; the similarity score increases by `_9_`.
*   The last number, `3`, appears in the right list three times; the similarity score again increases by `_9_`.

So, for these example lists, the similarity score at the end of this process is `_31_` (`9 + 4 + 0 + 0 + 9 + 9`).

Once again consider your left and right lists. _What is their similarity score?_
*/

import { readFileAsMatrix, transpose } from '../utils/index.js'

const lines = readFileAsMatrix('data/day1.txt', /\s+/)
const cols = transpose(lines)

const left = cols[0].map(Number)
const right = cols[1].map(Number)

const counts: Map<number, number> = new Map()
for (const n of right) {
    counts.set(n, (counts.get(n) ?? 0) + 1)
}

let total = 0
for (let i = 0; i < left.length; i++) {
    total += left[i] * (counts.get(left[i]) ?? 0)
}

console.log(total)
