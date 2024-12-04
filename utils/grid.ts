import * as util from 'node:util'
import * as PF_ from 'pathfinding'
import { join, reverse } from './iter.ts'

const PF = PF_.default

export class Grid<T> {
    constructor(readonly grid: T[][]) {
        this[util.inspect.custom] = this.toString
    }

    static create<T>(width: number, height: number, value: T) {
        const grid: T[][] = []
        for (let y = 0; y < height; y++) {
            grid[y] = []
            for (let x = 0; x < width; x++) {
                grid[y][x] = value
            }
        }

        return new Grid(grid)
    }

    get width() {
        return this.grid[0].length
    }

    get height() {
        return this.grid.length
    }

    get(x: number, y: number) {
        return (this.grid[y] || [])[x]
    }

    set(x: number, y: number, value: T) {
        this.grid[y][x] = value
    }

    cursor(x: number, y: number) {
        return new GridCursor(this, x, y)
    }

    area(x1: number, y1: number, x2: number, y2: number) {
        return new GridArea(this, x1, y1, x2, y2)
    }

    row(y: number) {
        return this.area(0, y, this.width - 1, y)
    }

    col(x: number) {
        return this.area(x, 0, x, this.height - 1)
    }

    insertRow(x: number, init: T | ((index: number) => T)) {
        if (typeof init !== 'function') {
            const _init = init
            init = () => _init
        }

        this.grid.splice(x, 0, Array.from({ length: this.width }, init as any))
    }

    insertCol(y: number, init: T | ((index: number) => T)) {
        if (typeof init !== 'function') {
            const _init = init
            init = () => _init
        }

        for (const row of this.grid) {
            row.splice(y, 0, (init as any)(y))
        }
    }

    static isAdjacent(x1: number, y1: number, x2: number, y2: number) {
        return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1
    }

    *[Symbol.iterator]() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                yield this.cursor(x, y)
            }
        }
    }

    toString() {
        return `[Grid ${this.width}x${this.height}]`
    }

    find(fn: (cursor: GridCursor<T>) => boolean) {
        for (const cursor of this) {
            if (fn(cursor)) {
                return cursor
            }
        }

        return null
    }

    *findAll(fn: (cursor: GridCursor<T>) => boolean) {
        for (const cursor of this) {
            if (fn(cursor)) {
                yield cursor
            }
        }
    }

    setFrom(grid: Grid<T> | T[][], x: number, y: number) {
        if (grid instanceof Grid) {
            grid = grid.grid
        }

        for (let dy = 0; dy < grid.length; dy++) {
            for (let dx = 0; dx < grid[0].length; dx++) {
                this.set(x + dx, y + dy, grid[dy][dx])
            }
        }
    }

    *floodFillIter(params: {
        start?: [number, number]
        shouldFill?: (val: T, x: number, y: number) => boolean
        value?: (val: T, x: number, y: number) => T
    } = {}) {
        // eslint-disable-next-line ts/no-this-alias
        const self = this
        const mat = this.grid
        const {
            start = [0, 0],
            shouldFill = val => val === 0,
            value, // (val, x, y) => 1
        } = params

        const visited = new Set()
        const res = []
        const queue: Array<{ x: number, y: number }> = []

        function* visit(x, y) {
            if (x < 0 || x >= mat[0].length || y < 0 || y >= mat.length) {
                return
            }

            if (!shouldFill(mat[y][x], x, y)) {
                return
            }

            const key = `${x},${y}`
            if (visited.has(key)) {
                return
            }

            visited.add(key)

            yield self.cursor(x, y)

            if (value) {
                mat[y][x] = value(mat[y][x], x, y)
            }

            queue.push({ x, y })
        }

        yield * visit(...start)

        while (queue.length) {
            const { x, y } = queue.shift()!

            yield * visit(x - 1, y)
            yield * visit(x + 1, y)
            yield * visit(x, y - 1)
            yield * visit(x, y + 1)
        }

        return res
    }

    floodFill(params = {}) {
        return [...this.floodFillIter(params)]
    }

    pathfind(params: {
        start: GridCursor<T> | [number, number]
        end: GridCursor<T> | [number, number]
        walkable?: (val: T, x: number, y: number) => boolean
        finder?: 'AStarFinder' | 'BreadthFirstFinder' | 'DijkstraFinder' | 'IDAStarFinder' | 'JPSPFinder' | 'ManhattanFinder' | 'PathFinder' | 'RRTStarFinder'
        finderParams?: any
    }) {
        let {
            start,
            end,
            walkable,
            finder = 'AStarFinder',
            finderParams = {},
        } = params

        if (start instanceof GridCursor) start = [start.x, start.y]
        if (end instanceof GridCursor) end = [end.x, end.y]

        const grid = new PF.Grid(this.width, this.height)
        if (walkable) {
            for (const cursor of this) {
                grid.setWalkableAt(cursor.x, cursor.y, walkable(cursor.value, cursor.x, cursor.y))
            }
        }

        const finderInstance = new PF[finder](finderParams)

        return finderInstance.findPath(...start, ...end, grid)
    }

    dump(map: ((v: T) => string) | Record<any, string> = v => String(v)) {
        if (typeof map === 'object' || typeof map === 'string') {
            const _map = map
            map = (v => _map[v] || v) as any
        }

        for (let y = 0; y < this.height; y++) {
            console.log(this.grid[y].map(map as any).join(''))
        }
    }

    *tiles(w: number, h: number) {
        for (let y = 0; y < this.height; y += h) {
            for (let x = 0; x < this.width; x += w) {
                yield this.area(x, y, x + w - 1, y + h - 1)
            }
        }
    }
}

export class GridCursor<T> {
    constructor(
        readonly grid: Grid<T>,
        readonly x: number,
        readonly y: number,
    ) {
        this[util.inspect.custom] = this.toString
    }

    toString() {
        if (this.empty) {
            return `[GridCursor ${this.x},${this.y} (empty)]`
        }

        return `[GridCursor ${this.x},${this.y} ${this.value}]`
    }

    get key() {
        return `${this.x},${this.y}`
    }

    static fromKey(grid, key) {
        if (!key) return key => GridCursor.fromKey(grid, key)

        const [x, y] = key.split(',').map(Number)

        return new GridCursor(grid, x, y)
    }

    get empty() {
        return this.x < 0 || this.y < 0 || this.x >= this.grid.width || this.y >= this.grid.height
    }

    get value() {
        return this.grid.get(this.x, this.y)
    }

    set value(value) {
        this.grid.set(this.x, this.y, value)
    }

    get left() {
        return new GridCursor(this.grid, this.x - 1, this.y)
    }

    get right() {
        return new GridCursor(this.grid, this.x + 1, this.y)
    }

    get up() {
        return new GridCursor(this.grid, this.x, this.y - 1)
    }

    get down() {
        return new GridCursor(this.grid, this.x, this.y + 1)
    }

    get upLeft() {
        return new GridCursor(this.grid, this.x - 1, this.y - 1)
    }

    get upRight() {
        return new GridCursor(this.grid, this.x + 1, this.y - 1)
    }

    get downLeft() {
        return new GridCursor(this.grid, this.x - 1, this.y + 1)
    }

    get downRight() {
        return new GridCursor(this.grid, this.x + 1, this.y + 1)
    }

    get neighbors() {
        return [
            this.up,
            this.upRight,
            this.right,
            this.downRight,
            this.down,
            this.downLeft,
            this.left,
            this.upLeft,
        ]
    }

    get crossNeighbors() {
        return [
            this.up,
            this.right,
            this.down,
            this.left,
        ]
    }

    prev() {
        let { x, y } = this

        if (x - 1 < 0) {
            x = this.grid.width - 1
            y--
        } else {
            x--
        }

        return new GridCursor(this.grid, x, y)
    }

    next() {
        let { x, y } = this

        if (x + 1 >= this.grid.width) {
            x = 0
            y++
        } else {
            x++
        }

        return new GridCursor(this.grid, x, y)
    }

    hasNext() {
        return this.x + 1 < this.grid.width || this.y + 1 < this.grid.height
    }

    eq(other: GridCursor<T>): boolean
    eq(otherX: number, otherY: number): boolean
    eq(other: GridCursor<T> | number, other2?: number): boolean {
        if (typeof other === 'number') {
            return this.x === other && this.y === other2
        }

        return this.x === other.x && this.y === other.y
    }

    isAdjacentTo(other: GridCursor<T> | GridArea<T>) {
        if (other instanceof GridCursor) {
            return Grid.isAdjacent(this.x, this.y, other.x, other.y)
        } else if (other instanceof GridArea) {
            return other.isAdjacentTo(this)
        }
    }

    areaTo(other: GridCursor<T>) {
        const x1 = Math.min(this.x, other.x)
        const y1 = Math.min(this.y, other.y)
        const x2 = Math.max(this.x, other.x)
        const y2 = Math.max(this.y, other.y)

        return new GridArea(this.grid, x1, y1, x2, y2)
    }

    areaToOffset(dx: number, dy: number) {
        return new GridArea(this.grid, this.x, this.y, this.x + dx, this.y + dy)
    }

    hasOffset(dx: number, dy: number) {
        const newX = this.x + dx
        const newY = this.y + dy

        return newX >= 0 && newY >= 0 && newX < this.grid.width && newY < this.grid.height
    }

    offset(dx: number, dy: number) {
        return new GridCursor(this.grid, this.x + dx, this.y + dy)
    }

    ray(dx: number, dy: number) {
        const items: T[] = []

        const directionX = Math.sign(dx)
        const directionY = Math.sign(dy)
        const len = Math.max(Math.abs(dx), Math.abs(dy))

        for (let i = 0; i <= len; i++) {
            items.push(this.offset(directionX * i, directionY * i).value)
        }

        return items
    }
}

export class GridArea<T> {
    constructor(
        readonly grid: Grid<T>,
        readonly x1: number,
        readonly y1: number,
        readonly x2: number,
        readonly y2: number,
    ) {
        this[util.inspect.custom] = this.toString
    }

    toString() {
        if (this.isOneLineHorizontal) {
            return `[GridArea ${this.x1},${this.y1}-${this.x2},${this.y2} w=${this.width}, h=${this.height}, ltr=${this.asStringLtr()}]`
        }
        if (this.isOneLineVertical) {
            return `[GridArea ${this.x1},${this.y1}-${this.x2},${this.y2} w=${this.width}, h=${this.height}, ttb=${this.asStringTtb()}]`
        }

        return `[GridArea ${this.x1},${this.y1}-${this.x2},${this.y2} w=${this.width}, h=${this.height}]`
    }

    get empty() {
        return this.width <= 0 || this.height <= 0
    }

    get width() {
        return Math.abs(this.x2 - this.x1) + 1
    }

    get height() {
        return Math.abs(this.y2 - this.y1) + 1
    }

    get isOneLineHorizontal() {
        return this.height === 1
    }

    get isOneLineVertical() {
        return this.width === 1
    }

    get area() {
        return this.width * this.height
    }

    get areaWithin() {
        return Math.max(0, (this.width - 2) * (this.height - 2))
    }

    get(x, y) {
        return this.grid.get(this.x1 + x, this.y1 + y)
    }

    *[Symbol.iterator]() {
        for (let y = this.y1; y <= this.y2; y++) {
            for (let x = this.x1; x <= this.x2; x++) {
                yield this.grid.cursor(x, y)
            }
        }
    }

    *values() {
        for (let y = this.y1; y <= this.y2; y++) {
            for (let x = this.x1; x <= this.x2; x++) {
                yield this.grid.get(x, y)
            }
        }
    }

    eq(other) {
        return this.x1 === other.x1 && this.y1 === other.y1 && this.x2 === other.x2 && this.y2 === other.y2
    }

    intersects(other) {
        return this.x1 <= other.x2 && this.x2 >= other.x1 && this.y1 <= other.y2 && this.y2 >= other.y1
    }

    intersection(other) {
        const x1 = Math.max(this.x1, other.x1)
        const y1 = Math.max(this.y1, other.y1)
        const x2 = Math.min(this.x2, other.x2)
        const y2 = Math.min(this.y2, other.y2)

        return new GridArea(this.grid, x1, y1, x2 - x1, y2 - y1)
    }

    union(other) {
        const x1 = Math.min(this.x1, other.x1)
        const y1 = Math.min(this.y1, other.y1)
        const x2 = Math.max(this.x2, other.x2)
        const y2 = Math.max(this.y2, other.y2)

        return new GridArea(this.grid, x1, y1, x2, y2)
    }

    isAdjacentTo(other) {
        if (other instanceof GridCursor) {
            const { x, y } = other

            return x >= this.x1 - 1 && x <= this.x2 + 1 && y >= this.y1 - 1 && y <= this.y2 + 1
        } else if (other instanceof GridArea) {
            const { x1, y1, x2, y2 } = other

            return x1 >= this.x1 - 1 && x2 <= this.x2 + 1 && y1 >= this.y1 - 1 && y2 <= this.y2 + 1
        } else {
            throw new TypeError('Invalid argument', { cause: other })
        }
    }

    contains(other) {
        if (other instanceof GridCursor) {
            const { x, y } = other

            return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2
        }

        if (other instanceof GridArea) {
            const { x1, y1, x2, y2 } = other

            return x1 >= this.x1 && x2 <= this.x2 && y1 >= this.y1 && y2 <= this.y2
        }

        throw new Error('Invalid argument', { cause: other })
    }

    asStringLtr() {
        if (!this.isOneLineHorizontal) throw new Error('GridArea must be one line')

        return join(this.values(), '')
    }

    asStringRtl() {
        if (!this.isOneLineHorizontal) throw new Error('GridArea must be one line')

        return join(reverse(this.values()), '')
    }

    asStringTtb() {
        if (!this.isOneLineVertical) throw new Error('GridArea must be one line')

        return join(this.values(), '')
    }

    asStringBtt() {
        if (!this.isOneLineVertical) throw new Error('GridArea must be one line')

        return join(reverse(this.values()), '')
    }

    find(fn: (cursor: GridCursor<T>) => boolean) {
        for (const cursor of this) {
            if (fn(cursor)) {
                return cursor
            }
        }

        return null
    }

    *findAll(fn: (cursor: GridCursor<T>) => boolean) {
        for (const cursor of this) {
            if (fn(cursor)) {
                yield cursor
            }
        }
    }
}
