// Adapter pattern - Adapts a 3rd party library with a better interface

import { Bag } from 'typescript-collections'

export function singleton<T>(element: T, amount = 1): Bag<T> {
    let bag = new Bag<T>()
    bag.add(element, amount)
    return bag
}

export function sum<T>(a: Bag<T>, b: Bag<T>): Bag<T> {
    let bag = new Bag<T>()

    universe(a, b).forEach(key => bag.add(key, a.count(key) + b.count(key)))

    return bag
}

export function sumAll<T>(array: Bag<T>[]): Bag<T> {
    switch (array.length) {
        case 0: 
            return new Bag()
        default:
            const [first, ...rest] = array
            return sum(first, sumAll(rest))
    }
}

function universe<T>(a: Bag<T>, b: Bag<T>): T[] {
    let set = a.toSet()
    set.union(b.toSet())
    return set.toArray()
}

export function multiplyCounts<T>(n: number, bag: Bag<T>): Bag<T> {
    let retVal = new Bag<T>()

    bag.toSet().forEach(key => retVal.add(key, n * bag.count(key)))

    // // alt
    // bag.forEach(key => retVal.add(key, n))
    // 10 * 3 = 3 + 3 + 3 + ...

    return retVal
}

export function toMap<T>(bag: Bag<T>): Map<T, number> {
    let map = new Map<T, number>();

    bag.toSet().forEach(key => {
        map.set(key, bag.count(key))
    })

    return map
}

export function equals<T>(a: Bag<T>, b: Bag<T>): boolean {
    let allKeysSet = a.toSet();
    allKeysSet.union(b.toSet());
    const allKeysArray = allKeysSet.toArray();
    return allKeysArray.every(element => a.count(element) === b.count(element));
}