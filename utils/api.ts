import { ffetchBase } from '@fuman/fetch'
import * as cheerio from 'cheerio'
import Turndown from 'turndown'
import 'dotenv/config'

const turndownService = new Turndown()
turndownService.addRule('pre', {
    filter: 'pre',
    replacement: content => `\`\`\`\n${content.trim()}\n\`\`\`\n`,
})
turndownService.addRule('p', {
    filter: 'p',
    replacement: content => `${wrapStringAt(content, 120)}\n\n`,
})
turndownService.addRule('h2', {
    filter: 'h2',
    replacement: content => `## ${content.replace(/---/g, '')}\n\n`,
})

const ffetch = ffetchBase.extend({
    baseUrl: 'https://adventofcode.com',
    headers: {
        cookie: `session=${process.env.AOC_SESSION}`,
    },
})

export function getTodayChallengeDate() {
    const now = new Date()
    if (now.getMonth() !== 11) {
        throw new Error('Not December')
    }

    return { year: now.getFullYear(), day: now.getDate() }
}

function wrapStringAt(str: string, width: number) {
    const lines: string[] = []
    let line = ''
    for (const word of str.split(' ')) {
        if (line.length + word.length > width) {
            lines.push(line.trimEnd())
            line = ''
        }

        line += `${word} `
    }

    lines.push(line.trimEnd())
    return lines.join('\n')
}

function render($article) {
    return (turndownService as any).turndown($article.html())
}

export async function fetchChallenge(date = getTodayChallengeDate()) {
    const { year, day } = date
    console.log('[i] Fetching challenge %d (%d)', day, year)
    const task = await ffetch(`/${year}/day/${day}`).text()

    const $ = cheerio.load(task)
    const part1 = $('article.day-desc').eq(0)
    const part2 = $('article.day-desc').eq(1)

    return {
        date,
        // task: { part1, part2 },
        task: {
            part1: render(part1),
            part2: part2.length ? render(part2) : null,
            $,
        },
        submittable: $('form').length > 0,
    }
}

export async function fetchChallengeInput(date = getTodayChallengeDate()) {
    const { year, day } = date
    console.log('[i] Fetching challenge %d (%d) input', day, year)
    const input = await ffetch(`/${year}/day/${day}/input`).text()

    return input
}

export function tryExtractSampleInput(chall) {
    const code = chall.task.$('pre code')
    if (!code.length) return null

    return code.eq(0).text().trim()
}

export async function submitResult(date, part, result) {
    const { year, day } = date
    console.log('[i] Submitting result for challenge %d (%d)', day, year)
    const res = await ffetch.post(`/${year}/day/${day}/answer`, {
        form: {
            level: part,
            answer: result,
        },
    }).text()

    const $ = cheerio.load(res)
    const message = $('article p').text()

    const correct = message.includes('That\'s the right answer')
    const rank = message.match(/You got rank (\d+)/)?.[1]
    let timeoutCurrent = message.match(/You have ((?:\d+m )?\d+)s left to wait/)?.[1]
    // You gave an answer too recently; you have to wait after submitting an answer before trying again.  You have 1m 6s left to wait. [Return to Day 3]
    if (timeoutCurrent?.includes('m')) {
        const [min, sec] = timeoutCurrent.split('m ')
        timeoutCurrent = `${Number(min) * 60 + Number(sec)}`
    }

    // Because you have guessed incorrectly 5 times on this puzzle, please wait 5 minutes before trying again
    // Please wait one minute before trying again
    let timeoutNext = message.match(/please wait (one|\d+) minute/i)?.[1]
    if (timeoutNext === 'one') {
        timeoutNext = '1'
    }

    return { correct, rank, timeoutCurrent, timeoutNext, message }
}
