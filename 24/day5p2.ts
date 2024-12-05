/*
## \ Part Two

While the Elves get to work printing the correctly-ordered updates, you have a little time to fix the rest of them.

For each of the _incorrectly-ordered updates_, use the page ordering rules to put the page numbers in the right order.
For the above example, here are the three incorrectly-ordered updates and their correct orderings:

*   `75,97,47,61,53` becomes `97,75,_47_,61,53`.
*   `61,13,29` becomes `61,_29_,13`.
*   `97,13,75,29,47` becomes `97,75,_47_,29,13`.

After taking _only the incorrectly-ordered updates_ and ordering them correctly, their middle page numbers are `47`,
`29`, and `47`. Adding these together produces `_123_`.

Find the updates which are not in the correct order. _What do you get if you add up the middle page numbers after
correctly ordering just those updates?_
*/

import { readFileReader } from '../utils/index.js'

const r = readFileReader('data/day5.txt')

// value => values it must have before it
const rules = new Map<number, number[]>()
for (const line of r.paragraph()) {
    const [a, b] = line.split('|').map(Number)
    if (!rules.has(b)) {
        rules.set(b, [])
    }
    rules.get(b)!.push(a)
}

let sum = 0
for (const line of r.paragraph()) {
    const updates = line.split(',').map(Number)

    const all = new Set<number>(updates)

    function firstError(): [number, number] | null {
        const seen = new Set<number>()

        for (const num of updates) {
            seen.add(num)
            const mustHaveBefore = rules.get(num)
            if (!mustHaveBefore) continue

            for (const val of mustHaveBefore) {
                if (all.has(val) && !seen.has(val)) {
                    return [num, val]
                }
            }
        }

        return null
    }

    if (firstError() === null) continue

    let err
    while ((err = firstError()) != null) {
        updates.splice(updates.indexOf(err[0]), 1)
        updates.splice(updates.indexOf(err[1]) + 1, 0, err[0])
    }

    sum += updates[Math.floor(updates.length / 2)]
}

console.log(sum)
