// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck

import { enumerate } from './iter.js'

export function multiSplit(str, separators) {
    // multiSplit('a:b,c:d', [',', ':']) => [['a', 'b'], ['c', 'd']]
    let result = str

    function applySplit(sep, arr) {
        if (typeof arr === 'string') return arr.split(sep)
        return arr.map(it => applySplit(sep, it))
    }

    for (const sep of separators) {
        result = applySplit(sep, result)
    }

    return result
}

export function multiIter(arr, fn, path = []) {
    if (Array.isArray(arr[0])) {
        return arr.map((item, idx) => multiIter(item, fn, [...path, idx]))
    }

    return fn(arr, path)
}

export function multiGet(arr, path) {
    let result = arr
    for (const idx of path) {
        result = result[idx]
    }

    return result
}

export function multiSet(arr, path, value) {
    let result = arr
    for (const idx of path.slice(0, -1)) {
        result = result[idx]
    }

    result[path[path.length - 1]] = value
}

export function multiMap(arr, fn) {
    const result = []

    for (const [idx, item] of enumerate(arr)) {
        if (Array.isArray(item[0])) {
            result[idx] = multiMap(item, fn)
        } else {
            result[idx] = fn(item)
        }
    }

    return result
}

export function multiMapFilter(arr, fn) {
    const result = []

    for (const item of arr) {
        if (Array.isArray(item[0])) {
            result[idx].push(multiMapFilter(item, fn))
        } else {
            const mapped = fn(item)
            if (mapped !== undefined) {
                result.push(mapped)
            }
        }
    }

    return result
}

export function multiMapEach(arr, fn) {
    return multiMap(arr, item => item.map(fn))
}

export function multiMapFilterEach(arr, fn) {
    return multiMap(arr, item => item.map(fn).filter(it => it !== undefined))
}
