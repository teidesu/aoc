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
