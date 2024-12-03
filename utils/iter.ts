export function join(iterable: Iterable<any>, separator: string) {
    let first = true
    let result = ''

    for (const item of iterable) {
        if (first) {
            first = false
        } else {
            result += separator
        }

        result += item
    }

    return result
}

export async function collectAsync<T>(iter: AsyncIterable<T>) {
    const result: T[] = []
    for await (const item of iter) {
        result.push(item)
    }

    return result
}

export function* reverse<T>(iterable: Iterable<T>) {
    const items = [...iterable]
    for (let i = items.length - 1; i >= 0; i--) {
        yield items[i]
    }
}

export function* enumerate<T>(arr: T[]): IterableIterator<[number, T]> {
    let idx = 0
    for (const item of arr) {
        yield [idx++, item]
    }
}
