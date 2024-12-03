import { fp, multiMap, multiSplit, readFileLines } from '../utils/index.js'

// only 12 red cubes, 13 green cubes, and 14 blue cubes
const MAX = {
    red: 12,
    green: 13,
    blue: 14,
}
function parseGame(line) {
    // Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
    const [, _idx, _picks] = line.match(/^Game (\d+): (.*)$/)

    const idx = Number(_idx)
    const picks_ = multiSplit(_picks, ['; ', ', ', ' '])
    const picks = multiMap(picks_, ([num, color]) => ({ num: Number(num), color }))

    return { idx, picks }
}

function isValidPick(pick) {
    const sumRed = fp.sum(it => it.color === 'red' ? it.num : 0)(pick)
    const sumGreen = fp.sum(it => it.color === 'green' ? it.num : 0)(pick)
    const sumBlue = fp.sum(it => it.color === 'blue' ? it.num : 0)(pick)

    return sumRed <= MAX.red && sumGreen <= MAX.green && sumBlue <= MAX.blue
}

let sum = 0
for (const line of readFileLines('data/day2.txt')) {
    const { idx, picks } = parseGame(line)

    if (picks.every(isValidPick)) {
        sum += idx
    }
}
console.log(sum)
