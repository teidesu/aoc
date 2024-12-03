export class LineReader {
    constructor(readonly line: string) {}
    index = 0

    get empty() {
        return this.index >= this.line.length
    }

    get hasMore() {
        return !this.empty
    }

    full() {
        return this.line
    }

    s() {
        return this.line.slice(this.index)
    }

    peek(n = Infinity) {
        return this.line.slice(this.index, this.index + n)
    }

    read(n = Infinity) {
        const result = this.peek(n)
        this.index += n
        return result
    }

    continue() {
        return this.read(1)
    }

    maybe(str: string): boolean
    maybe(str: RegExp): RegExpMatchArray | null
    maybe(str: string | RegExp) {
        if (str instanceof RegExp) {
            const match = this.peek().match(str)
            if (match) {
                this.index += match[0].length - 1
                return match
            }

            return null
        }

        if (this.peek(str.length) === str) {
            this.index += str.length
            return true
        }

        return false
    }

    endsWith(str: string) {
        return this.peek().endsWith(str)
    }

    numbers() {
        const result: number[] = []
        while (true) {
            try {
                const match = this.maybe(/(-?\d+)\s*/)
                if (!match) break
                result.push(Number(match[1]))
            } catch {
                break
            }
        }

        return result
    }

    words() {
        return this.read().split(/\s+/g)
    }

    never(): never {
        throw new Error(`Failed to parse line: ${this.line}`)
    }

    skipUntil(str: string | RegExp, withWhitespace = false) {
        if (str instanceof RegExp) {
            const match = this.line.slice(this.index).match(str)
            if (!match) this.never()
            this.index += match.index! + match[0].length
            return this
        }

        const index = this.line.indexOf(str, this.index)
        if (index === -1) this.never()
        this.index = index + str.length

        if (withWhitespace) this.skipWhitespace()

        return this
    }

    skipWhitespace() {
        this.skipUntil(/\S/)
        return this
    }

    replace(...args: Parameters<string['replace']>) {
        return this.s().replace(...args)
    }

    toString() {
        return this.s()
    }

    split(sep: string | RegExp) {
        return this.s().split(sep)
    }

    chars() {
        return this.split('')
    }

    match(re: RegExp) {
        return this.s().match(re)
    }
}

export class MultiLineReader {
    constructor(readonly lines: string[]) {
        for (let i = 0; i < lines.length; i++) {
            Object.defineProperty(this, i, { get: () => this.at(i) })
        }
    }

    index = 0

    at(index: number) {
        return new LineReader(this.lines[index])
    }

    peek(safe = true) {
        if (safe && this.index >= this.lines.length) {
            throw new Error('No more lines')
        }
        return new LineReader(this.lines[this.index] || '')
    }

    *[Symbol.iterator]() {
        for (; this.index < this.lines.length;) {
            yield new LineReader(this.lines[this.index++])
        }
    }

    next() {
        const result = this.peek()
        this.index++
        return result
    }

    *paragraph(eat = true) {
        while (true) {
            const line = this.peek(false)
            if (line.empty) {
                if (eat) this.index++
                break
            }

            if (line.empty) break
            yield line
            this.index++
        }
    }

    slice(start: number, end: number) {
        return this.lines.slice(start, end).map(line => new LineReader(line))
    }

    map(fn: (line: LineReader) => any) {
        return this.lines.map(line => fn(new LineReader(line)))
    }

    sliceMap(start: number, end: number, fn: (line: LineReader) => any) {
        if (!fn && typeof end === 'function') {
            fn = end
            end = this.lines.length
        }
        return this.lines.slice(start, end).map(line => fn(new LineReader(line)))
    }
}
