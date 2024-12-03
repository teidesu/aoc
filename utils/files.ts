import * as fs from 'node:fs'
import * as path from 'node:path'
import { LineReader, MultiLineReader } from './reader.js'

function pathRelativeToExecutable(file: string): string {
    return path.resolve(path.dirname(process.argv[1]), file)
}

export function readFileEntirely(path: string): string {
    return fs.readFileSync(pathRelativeToExecutable(path), 'utf8')
}

export function readFileLines(path: string): string[] {
    const lines = readFileEntirely(path).split(/\r?\n/g)
    if (lines[lines.length - 1] === '') {
        lines.pop()
    }

    return lines
}
export function readFileReader(path: string) {
    return new MultiLineReader(readFileLines(path))
}

export function readFileReaderSingle(path: string) {
    return new LineReader(readFileEntirely(path))
}

export function readFileAsMatrix(path: string, splitter: string | RegExp = '') {
    const lines: string[][] = []
    for (const line of readFileLines(path)) {
        lines.push(line.split(splitter))
    }

    return lines
}
