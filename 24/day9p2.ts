/*
## \ Part Two

Upon completion, two things immediately become clear. First, the disk definitely has a lot more contiguous free space,
just like the amphipod hoped. Second, the computer is running much more slowly! Maybe introducing all of that [file
system fragmentation](https://en.wikipedia.org/wiki/File_system_fragmentation) was a bad idea?

The eager amphipod already has a new plan: rather than move individual blocks, he'd like to try compacting the files on
his disk by moving _whole files_ instead.

This time, attempt to move whole files to the leftmost span of free space blocks that could fit the file. Attempt to
move each file exactly once in order of _decreasing file ID number_ starting with the file with the highest file ID
number. If there is no span of free space to the left of a file that is large enough to fit the file, the file does not
move.

The first example from above now proceeds differently:

```
00...111...2...333.44.5555.6666.777.888899
0099.111...2...333.44.5555.6666.777.8888..
0099.1117772...333.44.5555.6666.....8888..
0099.111777244.333....5555.6666.....8888..
00992111777.44.333....5555.6666.....8888..
```
The process of updating the filesystem checksum is the same; now, this example's checksum would be `_2858_`.

Start over, now compacting the amphipod's hard drive using this new method instead. _What is the resulting filesystem
checksum?_
*/
import { readFileEntirely } from '../utils/index.js'

const line = readFileEntirely('data/day9.txt').trim()

const data: number[] = []

let nextId = 0
const gapSpans: [number, number][] = []
const dataSpans: [number, number][] = []

for (let i = 0; i < line.length; i++) {
    const char = Number(line[i])

    const isFreeSpace = i % 2 === 1

    const thisId = isFreeSpace ? -1 : nextId++
    const startIdx = data.length
    for (let j = 0; j < char; j++) {
        data.push(thisId)
    }

    if (isFreeSpace) {
        gapSpans.push([startIdx, data.length])
    } else {
        dataSpans.push([startIdx, data.length])
    }
}

while (dataSpans.length) {
    const lastDataSpan = dataSpans.pop()!

    const size = lastDataSpan[1] - lastDataSpan[0]
    const matchingGapSpanIdx = gapSpans.findIndex(span => span[1] - span[0] >= size && span[0] <= lastDataSpan[0])
    if (matchingGapSpanIdx === -1) continue

    const matchingGapSpan = gapSpans[matchingGapSpanIdx]

    for (let i = 0; i < size; i++) {
        data[matchingGapSpan[0] + i] = data[lastDataSpan[0] + i]
        data[lastDataSpan[0] + i] = -1
    }

    if (size < matchingGapSpan[1] - matchingGapSpan[0]) {
        matchingGapSpan[0] += size
    } else {
        gapSpans.splice(matchingGapSpanIdx, 1)
    }
}

let checksum = 0

for (let i = 0; i < data.length; i++) {
    if (data[i] === -1) continue
    checksum += i * data[i]
}

console.log(checksum)
