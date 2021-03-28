export function mapEquals<A, B>(a: Map<A, B>, b: Map<A, B>): boolean {
    return isSubset(a, b) && isSubset(b, a)
}

export function map<K, A, B>(map: Map<K, A>, f: (a: A) => B): Map<K, B> {
    let retVal = new Map<K, B>();
    map.forEach((value, key) => {
        retVal.set(key, f(value))
    })

    return retVal;
}

export function filter<K, V>(map: Map<K, V>, predicate: (v: V) => boolean): Map<K, V> {
    let retVal = new Map<K,V>();
    map.forEach((value, key) => {
        if (predicate(value)) {
            retVal.set(key, value)
        }
    })

    return retVal
}

export function difference<K>(a: Map<K, number>, b: Map<K, number>): Map<K, number> {
    const allKeys = new Set([...a.keys(), ...b.keys()])

    let map = new Map<K, number>();

    for (let key of allKeys.values()) {
        map.set(key, (a.get(key) || 0) - (b.get(key) || 0))
    }

    return map//filter(map, v => v !== 0)
}

export function toString(map: Map<string, number>): string {
    return `{ ${[...map.entries()].map(([k, v]) => `${k}: ${v}`).join(', ')} }`
}


export function merge(maps: Map<string, number>[]): Map<string, number> {
    let retVal = new Map<string, number>();
    maps.forEach(map => {
        map.forEach((value, key) => {
            retVal.set(key, value + (retVal.get(key) || 0))
        })
    })

    return retVal
}

// a = {'brett': 20, 'nick': 30}
// b = {'brett': 20, 'nick': 30, 'cal': 40}
function isSubset<A, B>(a: Map<A, B>, b: Map<A, B>): boolean {
    for (let key of a.keys()) {
        if (!b.has(key) || a.get(key) !== b.get(key))
            return false
    }

    return true
}