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
