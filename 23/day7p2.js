/*
## \ Part Two

To make things a little more interesting, the Elf introduces one additional rule. Now, `J` cards are
[jokers](https://en.wikipedia.org/wiki/Joker_(playing_card)) - wildcards that can act like whatever card would make the
hand the strongest type possible.

To balance this, _`J` cards are now the weakest_ individual cards, weaker even than `2`. The other cards stay in the
same order: `A`, `K`, `Q`, `T`, `9`, `8`, `7`, `6`, `5`, `4`, `3`, `2`, `J`.

`J` cards can pretend to be whatever card is best for the purpose of determining hand type; for example, `QJJQ2` is now
considered _four of a kind_. However, for the purpose of breaking ties between two hands of the same type, `J` is always
treated as `J`, not the card it's pretending to be: `JKKK2` is weaker than `QQQQ2` because `J` is weaker than `Q`.

Now, the above example goes very differently:

```
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483
```

*   `32T3K` is still the only _one pair_; it doesn't contain any jokers, so its strength doesn't increase.
*   `KK677` is now the only _two pair_, making it the second-weakest hand.
*   `T55J5`, `KTJJT`, and `QQQJA` are now all _four of a kind_! `T55J5` gets rank 3, `QQQJA` gets rank 4, and `KTJJT` gets rank 5.

With the new joker rule, the total winnings in this example are `_5905_`.

Using the new joker rule, find the rank of every hand in your set. _What are the new total winnings?_
*/

import { enumerate, magic, readFileLines } from '../utils/index.js'

magic()

const lines = readFileLines('data/day7.txt')
const hands = lines.map(line => line.split(' ')).map(([hand, bid]) => ({ hand, bid: Number(bid) }))

function cardsToRank(card) {
    const ranks = 'AKQT98765432J'
    const rank = ranks.indexOf(card)
    if (rank === -1) throw new Error(`Unknown card ${card}`)
    return rank
}

const types = [
    'five of a kind',
    'four of a kind',
    'full house',
    'three of a kind',
    'two pair',
    'one pair',
    'high card',
]
function cardToType(card) {
    const counts = {}
    let jokers = 0
    for (const c of card) {
        if (c === 'J') {
            jokers++
            continue
        }

        counts[c] = (counts[c] || 0) + 1
    }

    const count5 = Object.values(counts).filter(count => count === 5).length
    const count4 = Object.values(counts).filter(count => count === 4).length
    const count3 = Object.values(counts).filter(count => count === 3).length
    const count2 = Object.values(counts).filter(count => count === 2).length

    // console.log(card, counts, jokers, count5, count4, count3, count2)

    if (count5 || (count4 && jokers)) {
        return 'five of a kind'
    }

    if (count4) {
        if (jokers) {
            return 'five of a kind'
        }
        return 'four of a kind'
    }

    if (count3 && jokers) {
        if (jokers === 2) {
            return 'five of a kind'
        }
        return 'four of a kind'
    }

    if (count3 && count2) {
        return 'full house'
    }

    if (count2 === 2 && jokers) {
        return 'full house'
    }

    if (count3 || (count2 === 2 && jokers)) {
        return 'three of a kind'
    }

    if (count2 === 2) {
        if (jokers === 1) {
            return 'three of a kind'
        }
        return 'two pair'
    }

    if (count2 === 1) {
        if (jokers === 3) {
            return 'five of a kind'
        }
        if (jokers === 2) {
            return 'four of a kind'
        }
        if (jokers === 1) {
            return 'three of a kind'
        }
        return 'one pair'
    }

    if (count2 === 0) {
        if (jokers === 5 || jokers === 4) {
            return 'five of a kind'
        }
        if (jokers === 3) {
            return 'four of a kind'
        }
        if (jokers === 2) {
            return 'three of a kind'
        }
        if (jokers === 1) {
            return 'one pair'
        }
    }

    return 'high card'
}

hands.forEach((hand) => {
    hand.type = cardToType(hand.hand)
    if (hand.hand.includes('J')) { console.log(hand.hand, hand.type) }
})

hands.sort((a, b) => {
    if (a.type !== b.type) {
        return types.indexOf(a.type) - types.indexOf(b.type)
    }

    const aCards = [...a.hand].map(cardsToRank)
    const bCards = [...b.hand].map(cardsToRank)

    for (let i = 0; i < aCards.length; i++) {
        if (aCards[i] !== bCards[i]) {
            return aCards[i] - bCards[i]
        }
    }

    return 0
})

let res = 0
for (const [idx, it] of enumerate(hands)) {
    res += it.bid * (hands.length - idx)
}

console.log(res)
