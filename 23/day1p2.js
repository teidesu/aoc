import { readFileLines } from '../utils/files.js'

const NUMBERS = 'one, two, three, four, five, six, seven, eight, nine'.split(', ')

function extractCalibrationValues(line) {
    let firstInt

    outer: for (let i = 0; i < line.length;) {
        for (const n of NUMBERS) {
            if (line.substring(i, i + n.length) !== n) continue
            firstInt = NUMBERS.indexOf(n) + 1
            break outer
        }

        if (line[i].match(/\d/)) {
            firstInt = line[i]
            break
        }

        i++
    }

    let lastInt
    outer: for (let i = line.length - 1; i >= 0;) {
        for (const n of NUMBERS) {
            if (line.substring(i, i + n.length) !== n) continue
            lastInt = NUMBERS.indexOf(n) + 1
            break outer
        }

        if (line[i].match(/\d/)) {
            lastInt = line[i]
            break
        }

        i--
    }

    if (firstInt === undefined || lastInt === undefined) return null

    return `${firstInt}${lastInt}`
}

let sum = 0
for await (const line of readFileLines('data/day1.txt')) {
    const value = extractCalibrationValues(line)
    console.log(line, value)
    if (value === null || !value.match(/^\d\d$/)) {
        continue
    }
    sum += Number(value)
}

console.log(sum)
