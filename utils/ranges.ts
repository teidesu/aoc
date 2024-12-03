import type { UnsafeMutable } from '@fuman/utils'
import * as util from 'node:util'

function hasDecimal(n) {
    return n !== Math.floor(n)
}

export class IntRange {
    private _startInclusive = true
    private _endInclusive = false
    private constructor(
        readonly start: number,
        readonly end: number,
    ) {
        this._startInclusive = true
        this._endInclusive = false
        this[util.inspect.custom] = this.toString
    }

    get empty() {
        return this.start >= this.end
    }

    toString() {
        const bracketLeft = this._startInclusive ? '[' : '('
        const bracketRight = this._endInclusive ? ']' : ')'
        return `[IntRange ${bracketLeft}${this.start}, ${this.end}${bracketRight}]`
    }

    // this is fine since we're only considering integers
    static ee(start: number, end: number) {
        const r = new IntRange(start, end)
        r._startInclusive = false
        r._endInclusive = false
        return r
    }

    static ei(start: number, end: number) {
        const r = new IntRange(start, end)
        r._startInclusive = false
        r._endInclusive = true
        return r
    }

    static ie(start: number, end: number) {
        const r = new IntRange(start, end)
        r._startInclusive = true
        r._endInclusive = false
        return r
    }

    static ii(start: number, end: number) {
        const r = new IntRange(start, end)
        r._startInclusive = true
        r._endInclusive = true
        return r
    }

    // normalized = [start, end)
    get normalizedStart() {
        if (this._startInclusive) {
            return this.start
        }
        return hasDecimal(this.start) ? Math.ceil(this.start) : this.start + 1
    }

    get normalizedEnd() {
        // return this._endInclusive ? this.end + 1 : this.end
        if (this._endInclusive) {
            return this.end + 1
        }
        return hasDecimal(this.end) ? Math.floor(this.end) + 1 : this.end
    }

    _getNormalizedStartEnd() {
        return [
            this.normalizedStart,
            this.normalizedEnd,
        ]
    }

    get length() {
        const [start, end] = this._getNormalizedStartEnd()

        return Math.max(0, end - start)
    }

    *[Symbol.iterator]() {
        const [start, end] = this._getNormalizedStartEnd()

        for (let i = start; i < end; i++) {
            yield i
        }
    }

    toArray() {
        return [...this]
    }

    includes(n: number | IntRange) {
        const [start, end] = this._getNormalizedStartEnd()

        if (n instanceof IntRange) {
            const [nStart, nEnd] = n._getNormalizedStartEnd()

            return start <= nStart && nEnd <= end
        }

        return start <= n && n < end
    }

    overlaps(other: IntRange) {
        const [start, end] = this._getNormalizedStartEnd()
        const [otherStart, otherEnd] = other._getNormalizedStartEnd()

        return start < otherEnd && otherStart < end
    }

    // whether the ranges touch (i.e. share a border, but don't overlap)
    // returns {inner,outer}-{left,right} | false
    // left/right is relative to this range
    touches(other: IntRange) {
        const [start, end] = this._getNormalizedStartEnd()
        const [otherStart, otherEnd] = other._getNormalizedStartEnd()

        if (start === otherEnd) {
            return 'outer-left'
        }

        if (end === otherStart) {
            return 'outer-right'
        }

        if (start === otherStart) {
            return 'inner-left'
        }

        if (end === otherEnd) {
            return 'inner-right'
        }

        return false
    }

    touchesInnerR(other: IntRange) {
        return this.touches(other) === 'inner-right'
    }

    touchesInnerL(other: IntRange) {
        return this.touches(other) === 'inner-left'
    }

    touchesInner(other: IntRange) {
        switch (this.touches(other)) {
            case 'inner-left':
            case 'inner-right':
                return true
            default:
                return false
        }
    }

    touchesOuterR(other: IntRange) {
        return this.touches(other) === 'outer-right'
    }

    touchesOuterL(other: IntRange) {
        return this.touches(other) === 'outer-left'
    }

    touchesOuter(other: IntRange) {
        switch (this.touches(other)) {
            case 'outer-left':
            case 'outer-right':
                return true
            default:
                return false
        }
    }

    intersect(other: IntRange) {
        const [start, end] = this._getNormalizedStartEnd()
        const [otherStart, otherEnd] = other._getNormalizedStartEnd()

        const newStart = Math.max(start, otherStart)
        const newEnd = Math.min(end, otherEnd)

        return IntRange.ie(newStart, newEnd)
    }

    union(other: IntRange) {
        if (!(this.touches(other) || this.overlaps(other))) {
            throw new Error(`Ranges don't touch or overlap: ${this} ${other}`)
        }

        const [start, end] = this._getNormalizedStartEnd()
        const [otherStart, otherEnd] = other._getNormalizedStartEnd()

        const newStart = Math.min(start, otherStart)
        const newEnd = Math.max(end, otherEnd)

        return IntRange.ie(newStart, newEnd)
    }

    eq(other: IntRange) {
        const [start, end] = this._getNormalizedStartEnd()
        const [otherStart, otherEnd] = other._getNormalizedStartEnd()

        return start === otherStart && end === otherEnd
    }

    clone() {
        const r = new IntRange(this.start, this.end)
        r._startInclusive = this._startInclusive
        r._endInclusive = this._endInclusive
        return r
    }

    offset(n: number) {
        const r = this.clone()
        ;(r as UnsafeMutable<IntRange>).start += n
        ;(r as UnsafeMutable<IntRange>).end += n
        return r
    }
}

export class MultiIntRange {
    ranges: IntRange[]
    constructor(ranges: IntRange[] = []) {
        this.ranges = MultiIntRange.simplify(ranges)
        this[util.inspect.custom] = this.toString
    }

    static simplify(ranges: IntRange[]) {
        if (ranges.length <= 1) return ranges

        ranges.sort((a, b) => a.start - b.start)

        const newRanges = [ranges[0]]

        for (let i = 1; i < ranges.length; i++) {
            const last = newRanges[newRanges.length - 1]
            const current = ranges[i]

            if (current.normalizedStart <= last.normalizedEnd) {
                newRanges[newRanges.length - 1] = last.union(current)
            } else {
                newRanges.push(current)
            }
        }

        return newRanges
    }

    get empty() {
        return this.ranges.length === 0
    }

    toString() {
        if (this.empty) return '[MultiIntRange empty]'
        return `[MultiIntRange ${this.ranges.join(', ')}]`
    }

    clone() {
        return new MultiIntRange(this.ranges.map(r => r.clone()))
    }

    add(other: IntRange | MultiIntRange | IntRange[]) {
        if (other instanceof MultiIntRange) {
            this.ranges.push(...other.ranges)
        } else if (other instanceof IntRange) {
            this.ranges.push(other)
        } else if (Array.isArray(other)) {
            this.ranges.push(...other)
        }

        this.ranges = MultiIntRange.simplify(this.ranges)
    }

    remove(other: IntRange | MultiIntRange | IntRange[]) {
        if (other instanceof MultiIntRange) {
            return this.remove(other.ranges)
        } else if (Array.isArray(other)) {
            for (const range of other) {
                this.remove(range)
            }
            return
        }

        const newRanges: IntRange[] = []

        for (const range of this.ranges) {
            if (range.overlaps(other)) {
                const intersection = range.intersect(other)

                if (intersection.empty) {
                    newRanges.push(range)
                } else {
                    const [start, end] = range._getNormalizedStartEnd()
                    const [otherStart, otherEnd] = other._getNormalizedStartEnd()

                    if (start < otherStart) {
                        newRanges.push(IntRange.ie(start, otherStart))
                    }

                    if (otherEnd < end) {
                        newRanges.push(IntRange.ie(otherEnd, end))
                    }
                }
            } else {
                newRanges.push(range)
            }
        }

        this.ranges = MultiIntRange.simplify(newRanges)
    }

    includes(n: number | IntRange) {
        for (const range of this.ranges) {
            if (range.includes(n)) return true
        }

        return false
    }

    overlaps(other: IntRange) {
        for (const range of this.ranges) {
            if (range.overlaps(other)) return true
        }

        return false
    }

    intersect(other: IntRange | MultiIntRange | IntRange[]) {
        if (!(other instanceof MultiIntRange)) {
            if (!Array.isArray(other)) other = [other]
            other = new MultiIntRange(other)
        }

        const newRanges: IntRange[] = []

        for (const range of this.ranges) {
            for (const otherRange of other.ranges) {
                if (range.overlaps(otherRange)) {
                    newRanges.push(range.intersect(otherRange))
                }
            }
        }

        return new MultiIntRange(newRanges)
    }

    get size() {
        return this.ranges.reduce((acc, cur) => acc + cur.length, 0)
    }
}
