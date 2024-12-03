import { IntRange, MultiIntRange } from './ranges.js'

export function solveQuadratic(a: number, b: number, c: number) {
    const discriminant = b * b - 4 * a * c
    if (discriminant < 0) {
        return []
    } else if (discriminant === 0) {
        return [-b / (2 * a)]
    } else {
        const sqrt = Math.sqrt(discriminant)
        return [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)]
    }
}

const emptyRange = () => new MultiIntRange()
const infiniteRange = () => new MultiIntRange([IntRange.ii(-Infinity, Infinity)])

export function solveQuadraticInequality(a: number, b: number, c: number, sign: '<' | '<=' | '>' | '>=') {
    const solutions = solveQuadratic(a, b, c)
    if (solutions.length === 0) {
        return emptyRange()
    }

    if (solutions.length === 1) {
        const [sol] = solutions
        switch (sign) {
            case '<':
                return sol < 0 ? infiniteRange() : emptyRange()
            case '<=':
                return sol <= 0 ? infiniteRange() : emptyRange()
            case '>':
                return sol > 0 ? infiniteRange() : emptyRange()
            case '>=':
                return sol >= 0 ? infiniteRange() : emptyRange()
        }
    }

    let [x1, x2] = solutions
    if (x1 > x2) [x1, x2] = [x2, x1]

    // parabola opens up?
    const opensUp = a < 0

    switch (sign) {
        case '<':
            if (opensUp) {
                return new MultiIntRange([IntRange.ie(-Infinity, x1), IntRange.ei(x2, Infinity)])
            } else {
                return new MultiIntRange([IntRange.ee(x1, x2)])
            }
        case '<=':
            if (opensUp) {
                return new MultiIntRange([IntRange.ii(-Infinity, x1), IntRange.ii(x2, Infinity)])
            } else {
                return new MultiIntRange([IntRange.ii(x1, x2), IntRange.ii(x2, Infinity)])
            }
        case '>':
            if (opensUp) {
                return new MultiIntRange([IntRange.ee(x1, x2)])
            } else {
                return new MultiIntRange([IntRange.ie(-Infinity, x1), IntRange.ei(x2, Infinity)])
            }
        case '>=':
            if (opensUp) {
                return new MultiIntRange([IntRange.ii(x1, x2), IntRange.ii(x2, Infinity)])
            } else {
                return new MultiIntRange([IntRange.ii(-Infinity, x1), IntRange.ii(x2, Infinity)])
            }
        default:
            throw new Error(`Invalid sign ${sign}`)
    }
}

export function gcd2(a: number, b: number) {
    if (a === 0) { return b }

    while (b !== 0) {
        if (a > b) {
            a = a - b
        } else {
            b = b - a
        }
    }

    return a
}

export function gcd(nums: number[]) {
    return nums.reduce(gcd2, 0)
}

export function lcm2(a: number, b: number) {
    return a * b / gcd2(a, b)
}

export function lcm(nums: number[]) {
    return nums.reduce(lcm2, 1)
}
