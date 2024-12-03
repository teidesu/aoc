export class DefaultMap<K, V> extends Map<K, V> {
    #defaultValue: (key: K) => V
    constructor(defaultValue: V | ((key: K) => V)) {
        super()

        if (typeof defaultValue !== 'function') {
            this.#defaultValue = () => defaultValue
        } else {
            this.#defaultValue = defaultValue as (key: K) => V
        }
    }

    get(key) {
        if (!super.has(key)) {
            super.set(key, this.#defaultValue(key))
        }

        return super.get(key)
    }
}
