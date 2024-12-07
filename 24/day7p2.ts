/*
## \ Part Two

The engineers seem concerned; the total calibration result you gave them is nowhere close to being within safety
tolerances. Just then, you spot your mistake: some well-hidden elephants are holding a _third type of operator_.

The [concatenation](https://en.wikipedia.org/wiki/Concatenation) operator (`||`) combines the digits from its left and
right inputs into a single number. For example, `12 || 345` would become `12345`. All operators are still evaluated
left-to-right.

Now, apart from the three equations that could be made true using only addition and multiplication, the above example
has three more equations that can be made true by inserting operators:

*   `156: 15 6` can be made true through a single concatenation: `15 || 6 = 156`.
*   `7290: 6 8 6 15` can be made true using `6 * 8 || 6 * 15`.
*   `192: 17 8 14` can be made true using `17 || 8 + 14`.

Adding up all six test values (the three that could be made before using only `+` and `*` plus the new three that can
now be made by also using `||`) produces the new _total calibration result_ of `_11387_`.

Using your new knowledge of elephant hiding spots, determine which equations could possibly be true. _What is their
total calibration result?_
*/

import { combinations, readFileLines } from '../utils/index.js'

const lines = readFileLines('data/day7.txt')

let total = 0
for (const line of lines) {
    const [testValue, equation] = line.split(': ')
    const testValueNum = Number(testValue)
    const nums = equation.split(' ').map(Number)

    for (const ops of combinations(['+', '*', '||'], nums.length - 1)) {
        let result = nums[0]
        for (let i = 1; i < nums.length; i++) {
            const op = ops[i - 1]
            if (op === '||') {
                result = Number(`${result.toString()}${nums[i].toString()}`)
            } else if (op === '+') {
                result += nums[i]
            } else if (op === '*') {
                result *= nums[i]
            }
        }

        if (result === testValueNum) {
            total += result
            break
        }
    }
}

console.log(total)
