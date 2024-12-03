/*
## \ Part Two

Everyone will starve if you only plant such a small number of seeds. Re-reading the almanac, it looks like the `seeds:`
line actually describes _ranges of seed numbers_.

The values on the initial `seeds:` line come in pairs. Within each pair, the first value is the _start_ of the range and
the second value is the _length_ of the range. So, in the first line of the example above:

```
seeds: 79 14 55 13
```
This line describes two ranges of seed numbers to be planted in the garden. The first range starts with seed number `79`
and contains `14` values: `79`, `80`, ..., `91`, `92`. The second range starts with seed number `55` and contains `13`
values: `55`, `56`, ..., `66`, `67`.

Now, rather than considering four seed numbers, you need to consider a total of _27_ seed numbers.

In the above example, the lowest location number can be obtained from seed number `82`, which corresponds to soil `84`,
fertilizer `84`, water `84`, light `77`, temperature `45`, humidity `46`, and _location `46`_. So, the lowest location
number is `_46_`.

Consider all of the initial seed numbers listed in the ranges on the first line of the almanac. _What is the lowest
location number that corresponds to any of the initial seed numbers?_
*/

import { DefaultMap, fp, IntRange, magic, MultiIntRange, readFileReader } from '../utils/index.js'

magic()

const data = readFileReader('data/day5.txt')

const parsedSeeds = []
const parsedMaps = new DefaultMap(() => [])

for (const line of data) {
    if (line.maybe('seeds: ')) {
        const seeds = line.numbers()

        for (const [seed, len] of fp.chunk(2)(seeds)) {
            parsedSeeds.push(IntRange.ii(seed, seed + len))
        }

        data.next()
        continue
    }

    if (line.endsWith('map:')) {
        const [mapName] = line.words()

        for (const mapLine of data.paragraph()) {
            const [dest, src, len] = mapLine.numbers()
            parsedMaps.get(mapName).push({
                range: IntRange.ii(src, src + len),
                offset: dest - src,
            })
        }

        continue
    }

    line.never()
}

function getMap(source, target) {
    const map = parsedMaps.get(`${source}-to-${target}`)
    if (!map) throw new Error(`No map for ${source} to ${target}`)
    return map
}

function applyMap(from, to, range) {
    const unmapped = range
    const result = new MultiIntRange()

    for (const mapping of getMap(from, to)) {
        const intersection = unmapped.intersect(mapping.range)
        if (intersection.empty) {
            continue
        }

        unmapped.remove(intersection)
        result.add(intersection.ranges.map(r => r.offset(mapping.offset)))
    }

    result.add(unmapped)

    return result
}

let min = Infinity
for (const seed of parsedSeeds) {
    const soil = applyMap('seed', 'soil', new MultiIntRange([seed]))
    const fertilizer = applyMap('soil', 'fertilizer', soil)
    const water = applyMap('fertilizer', 'water', fertilizer)
    const light = applyMap('water', 'light', water)
    const temperature = applyMap('light', 'temperature', light)
    const humidity = applyMap('temperature', 'humidity', temperature)
    const location = applyMap('humidity', 'location', humidity)
    min = Math.min(min, location.ranges[0].start)
}
console.log(min)
