/*
## \ Part Two

As the race is about to start, you realize the piece of paper with race times and record distances you got earlier
actually just has very bad [kerning](https://en.wikipedia.org/wiki/Kerning). There's really _only one race_ - ignore the
spaces between the numbers on each line.

So, the example from before:

```
Time:      7  15   30
Distance:  9  40  200
```
...now instead means this:

```
Time:      71530
Distance:  940200
```
Now, you have to figure out how many ways there are to win this single race. In this example, the race lasts for
_`71530` milliseconds_ and the record distance you need to beat is _`940200` millimeters_. You could hold the button
anywhere from `14` to `71516` milliseconds and beat the record, a total of `_71503_` ways!

_How many ways can you beat the record in this one much longer race?_
*/

import { magic, readFileReader, solveQuadraticInequality } from '../utils/index.js'

magic()

const lines = readFileReader('data/day6.txt')

const time = Number(lines.at(0).skipUntil(/:\s+/).replace(/\s+/g, ''))
const maxDistance = Number(lines.at(1).skipUntil(/:\s+/).replace(/\s+/g, ''))

// hold * (time - hold) > distance
// time * hold - hold^2 > distance
// hold^2 - time * hold + distance < 0
const solutions = solveQuadraticInequality(1, -time, maxDistance, '<')
const waysToWin = solutions.size

console.log(waysToWin)
