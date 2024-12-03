import * as cp from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createInterface } from 'node:readline'

import { fetchChallenge, fetchChallengeInput, getTodayChallengeDate, submitResult, tryExtractSampleInput } from './utils/api.js'

// having the task in the template is both handy and also provides context for copilot
const TEMPLATE = `
/*
%TASK%
*/

import { readFileLines } from '../utils/index.js';

const lines = readFileLines('data/%DATA%')

for (const line of lines) {
    
}
`.trimStart()

let date
if (process.argv.length < 3) {
    date = getTodayChallengeDate()
} else {
    const [year, day] = process.argv[2].split('-').map(Number)
    date = day ? { year, day } : { year: new Date().getFullYear(), day: year }
}

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const folder = path.join(__dirname, String(date.year).slice(-2))
const dataFolder = path.join(folder, 'data')

const part1Solution = path.join(folder, `day${date.day}.ts`)
const part2Solution = path.join(folder, `day${date.day}p2.ts`)
const input = path.join(dataFolder, `day${date.day}.txt`)
const inputSample = path.join(dataFolder, `day${date.day}-sample.txt`)

const part1Exists = fs.existsSync(part1Solution)
const part2Exists = fs.existsSync(part2Solution)

function runNodemon(file: string) {
    const proc = cp.spawn('pnpx', ['tsx', 'watch', file], { stdio: 'inherit' })

    const sigintHandler = () => {
        proc.kill('SIGINT')
        process.off('SIGINT', sigintHandler)
    }

    process.on('SIGINT', sigintHandler)

    return new Promise<void>((resolve, reject) => {
        proc.on('exit', (code) => {
            process.off('SIGINT', sigintHandler)
            if (code) {
                reject(new Error(`Process exited with code ${code}`))
            } else {
                console.log() // newline so ^C doesn't mess up the terminal
                resolve()
            }
        })
        proc.on('error', reject)
    })
}

function runSolution(file: string) {
    return new Promise((resolve, reject) => {
        const proc = cp.spawn('pnpx', ['tsx', file], { stdio: ['inherit', 'pipe', 'inherit'] })
        let result = ''

        proc.stdout.on('data', (data) => {
            result += data
        })

        proc.on('exit', (code) => {
            if (code) reject(new Error(`Process exited with code ${code}`))
            else resolve(result.trim().split('\n').at(-1))
        })

        proc.on('error', reject)
    })
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
async function submitWrapper(date, part, result) {
    while (true) {
        try {
            const res = await submitResult(date, part, result)
            console.log(res.message)

            if (res.timeoutCurrent) {
                console.log(`Waiting for ${res.timeoutCurrent}s before retrying`)
                await sleep((Number(res.timeoutCurrent) + 1) * 1000)
                continue
            }

            if (!res.correct) {
                console.log(`Incorrect answer: ${result}`)
                if (res.timeoutNext) {
                    console.log(`Wait for ${res.timeoutNext} minutes before retrying`)
                }
                return
            }

            console.log('Correct!')
            console.log(`Rank: ${res.rank || 'n/a'}`)

            return true
        } catch (err) {
            console.log(err)
            console.log('Retrying in 5 seconds...')
            await sleep(5000)
        }
    }
}

function prompt(question: string) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close()
            resolve(answer)
        })
    })
}

function initPart1(chall) {
    fs.writeFileSync(input, chall.input)

    const sample = tryExtractSampleInput(chall)
    if (sample) {
        fs.writeFileSync(inputSample, sample)
    }

    const dataFile = path.relative(dataFolder, sample ? inputSample : input)

    fs.writeFileSync(
        part1Solution,
        TEMPLATE
            .replace('%TASK%', chall.task.part1)
            .replace('%DATA%', dataFile),
    )
}

function initPart2(chall) {
    const dataFile = path.relative(dataFolder, input)

    const code = part1Exists
        ? (function () {
            const code = fs.readFileSync(part1Solution, 'utf-8')
            const endOfComment = code.indexOf('*/')
            if (endOfComment === -1) {
                throw new Error('Invalid code')
            }

            return `/*\n${chall.task.part2}\n${code.slice(endOfComment)}`
        })()
        : TEMPLATE
            .replace('%TASK%', chall.task.part2)
            .replace('%DATA%', dataFile)
    fs.writeFileSync(
        part2Solution,
        code,
    )
}

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true })
}

const chall = await fetchChallenge(date)

let partToRun
if (!chall.task.part2) {
    if (!part1Exists) {
        (chall as any).input = await fetchChallengeInput(date)
        initPart1(chall)
    }

    partToRun = '1'
} else if (chall.submittable) {
    if (!part2Exists) initPart2(chall)
    partToRun = '2'
} else {
    partToRun = await prompt('Part? 1/2 ')
}

if (partToRun === '1') {
    await runNodemon(part1Solution)

    if (chall.submittable && !chall.task.part2) {
        const shouldSubmit = await prompt('Submit? Y/n ')

        if (shouldSubmit !== 'n') {
            const result = await runSolution(part1Solution)

            await submitWrapper(date, 1, result)
        }
    }
} else if (partToRun === '2') {
    await runNodemon(part2Solution)

    if (chall.submittable) {
        const shouldSubmit = await prompt('Submit? Y/n ')

        if (shouldSubmit !== 'n') {
            const result = await runSolution(part2Solution)

            await submitWrapper(date, 2, result)
        }
    }
} else {
    console.log('Invalid input')
}
