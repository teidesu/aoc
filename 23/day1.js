import { readFileLines } from '../utils/files.js'

function extractCalibrationValues(line) {
    let firstInt, lastInt

    for (let i = 0; i < line.length; i++) {
        if (line[i].match(/\d/)) {
            if (!firstInt) {
                firstInt = line[i]
            }

            lastInt = line[i]
        }
    }

    return `${firstInt}${lastInt}`
}

let sum = 0
for (const line of readFileLines('data/day1.txt')) {
    sum += Number.parseInt(extractCalibrationValues(line))
}

console.log(sum)
