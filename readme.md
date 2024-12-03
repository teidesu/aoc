# aoc

my [aoc](https://adventofcode.com/) solutions
mostly for 2023/24 for now, might retrospectively solve some more if i have nothing better to do

the code is utter garbage, but who cares

older solutions might not work because i keep updating my utils and i don't care enough to update the older solutions.
the general idea should still be clear though.

## running a solution

1. obtain the input and put it into the corresponding txt file, e.g.:

```sh
# data is stored in <year>/data/input<day>.txt
curl https://adventofcode.com/2023/day/3/input > 23/data/input3.txt
```

2. run the thing

```sh
# part 1
node 23/day3.js
# part 2
node 23/day3p2.js
```

## magic

for some magical data fetching and auto-submitting, you can use the `start.js` script
it lets me shave off quite a bit of time

```sh
# install deps first
pnpm install
# setup cookies
echo "AOC_SESSION=<your session cookie>" > .env
# run the script (for today)
tsx start.ts
# run the script (for a specific day)
tsx start.ts 2022-3
```

## license

wtfpl - do what the fuck you want to, i dont care
