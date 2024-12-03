import { fp, multiMap, multiSplit, readFileLines } from '../utils/index.js'

function parseGame(line) {
    // Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
    const [, _idx, _picks] = line.match(/^Game (\d+): (.*)$/)

    const idx = Number(_idx)
    const picks_ = multiSplit(_picks, ['; ', ', ', ' '])
    const picks = multiMap(picks_, ([num, color]) => ({ num: Number(num), color }))

    return { idx, picks: picks.flat() }
}

function getMaxPicks(pick) {
    const maxRed = fp.max()(pick.filter(p => p.color === 'red').map(p => p.num))
    const maxGreen = fp.max()(pick.filter(p => p.color === 'green').map(p => p.num))
    const maxBlue = fp.max()(pick.filter(p => p.color === 'blue').map(p => p.num))

    return { red: maxRed, green: maxGreen, blue: maxBlue }
}

let sum = 0
for (const line of readFileLines('data/day2.txt')) {
    const { picks } = parseGame(line)

    const maxPicks = getMaxPicks(picks)
    const power = maxPicks.red * maxPicks.green * maxPicks.blue
    sum += power
}
console.log(sum)
