export function pairDiffs(arr: number[]): number[] {
    return arr.slice(1).map((n, i) => n - arr[i])
}

export function transpose<T>(arr: T[][]): T[][] {
    const transposed: T[][] = []
    for (let i = 0; i < arr[0].length; i++) {
        const row: T[] = []
        for (let j = 0; j < arr.length; j++) {
            row.push(arr[j][i])
        }
        transposed.push(row)
    }
    return transposed
}

export function permutations<T>(arr: T[]): T[][] {
    const result: T[][] = []

    const permute = (arr: T[], m: T[] = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice()
                const next = curr.splice(i, 1)
                permute(curr.slice(), m.concat(next))
            }
        }
    }

    permute(arr)

    return result
}

export function product<T>(arraysToCombine: T[][]): T[][] {
    const divisors: number[] = []
    let combinationsCount = 1
    for (let i = arraysToCombine.length - 1; i >= 0; i--) {
        divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1
        combinationsCount *= (arraysToCombine[i].length || 1)
    }

    const getCombination = (n: number, arrays: T[][], divisors: number[]) => arrays.reduce((acc, arr, i) => {
        acc.push(arr[Math.floor(n / divisors[i]) % arr.length])
        return acc
    }, [])

    const combinations: T[][] = []
    for (let i = 0; i < combinationsCount; i++) {
        combinations.push(getCombination(i, arraysToCombine, divisors))
    }

    return combinations
}

export function combinations<T>(items: T[], k: number): T[][] {
    const result: T[][] = []

    function generateArrays(current: T[], remaining: number) {
        if (remaining === 0) {
            result.push([...current])
            return
        }

        for (let i = 0; i < items.length; i++) {
            current.push(items[i])
            generateArrays(current, remaining - 1)
            current.pop()
        }
    }

    generateArrays([], k)
    return result
}
