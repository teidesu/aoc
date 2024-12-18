/*
## \ Day 9: Mirage Maintenance

You ride the camel through the sandstorm and stop where the ghost's maps told you to stop. The sandstorm subsequently
subsides, somehow seeing you standing at an _oasis_!

The camel goes to get some water and you stretch your neck. As you look up, you discover what must be yet another giant
floating island, this one made of metal! That must be where the _parts to fix the sand machines_ come from.

There's even a [hang glider](https://en.wikipedia.org/wiki/Hang_gliding) partially buried in the sand here; once the sun
rises and heats up the sand, you might be able to use the glider and the hot air to get all the way up to the metal
island!

While you wait for the sun to rise, you admire the oasis hidden here in the middle of Desert Island. It must have a
delicate ecosystem; you might as well take some ecological readings while you wait. Maybe you can report any
environmental instabilities you find to someone so the oasis can be around for the next sandstorm-worn traveler.

You pull out your handy _Oasis And Sand Instability Sensor_ and analyze your surroundings. The OASIS produces a report
of many values and how they are changing over time (your puzzle input). Each line in the report contains the _history_
of a single value. For example:

```
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45
```
To best protect the oasis, your environmental report should include a _prediction of the next value_ in each history. To
do this, start by making a new sequence from the _difference at each step_ of your history. If that sequence is _not_
all zeroes, repeat this process, using the sequence you just generated as the input sequence. Once all of the values in
your latest sequence are zeroes, you can extrapolate what the next value of the original history should be.

In the above dataset, the first history is `0 3 6 9 12 15`. Because the values increase by `3` each step, the first
sequence of differences that you generate will be `3 3 3 3 3`. Note that this sequence has one fewer value than the
input sequence because at each step it considers two numbers from the input. Since these values aren't _all zero_,
repeat the process: the values differ by `0` at each step, so the next sequence is `0 0 0 0`. This means you have enough
information to extrapolate the history! Visually, these sequences can be arranged like this:

```
0   3   6   9  12  15
  3   3   3   3   3
    0   0   0   0
```
To extrapolate, start by adding a new zero to the end of your list of zeroes; because the zeroes represent differences
between the two values above them, this also means there is now a placeholder in every sequence above it:

```
0   3   6   9  12  15   _B_
  3   3   3   3   3   _A_
    0   0   0   0   _0_
```
You can then start filling in placeholders from the bottom up. `A` needs to be the result of increasing `3` (the value
to its left) by `0` (the value below it); this means `A` must be `_3_`:

```
0   3   6   9  12  15   B
  3   3   3   3   _3_   _3_
    0   0   0   0   _0_
```
Finally, you can fill in `B`, which needs to be the result of increasing `15` (the value to its left) by `3` (the value
below it), or `_18_`:

```
0   3   6   9  12  _15_  _18_
  3   3   3   3   3   _3_
    0   0   0   0   0
```
So, the next value of the first history is `_18_`.

Finding all-zero differences for the second history requires an additional sequence:

```
1   3   6  10  15  21
  2   3   4   5   6
    1   1   1   1
      0   0   0
```
Then, following the same process as before, work out the next value in each sequence from the bottom up:

```
1   3   6  10  15  21  _28_
  2   3   4   5   6   _7_
    1   1   1   1   _1_
      0   0   0   _0_
```
So, the next value of the second history is `_28_`.

The third history requires even more sequences, but its next value can be found the same way:

```
10  13  16  21  30  45  _68_
   3   3   5   9  15  _23_
     0   2   4   6   _8_
       2   2   2   _2_
         0   0   _0_
```
So, the next value of the third history is `_68_`.

If you find the next value for each history in this example and add them together, you get `_114_`.

Analyze your OASIS report and extrapolate the next value for each history. _What is the sum of these extrapolated
values?_
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

    let last = history[history.length - 1]
    last.push(0)

    for (const it of history.reverse()) {
        it.push(it[it.length - 1] + last[it.length - 1])
        last = it
    }

    return last[last.length - 1]
}

let sum = 0

for (const n of nums) {
    sum += extrapolate(n)
}

console.log(sum)
