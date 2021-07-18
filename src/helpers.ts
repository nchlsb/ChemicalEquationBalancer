export function randomIntegerUpTo(max: number): number {
    const between0and1 = Math.random()
    const floatBetween0andMax = between0and1 * max
    return Math.floor(floatBetween0andMax)
}

export function range(n: number): number[] {
    let retVal: number[] = [];

    for (let i = 0; i < n; i++) {
        retVal.push(i);
    }

    return retVal;
}

export function replaceAtIndex<T>(array: T[], index: number, value: T): T[] {
    let retVal = new Array<T>();
    
    for (let i = 0; i < array.length; i++){
        retVal[i] = (i === index) ? value : array[i]
    }

    return retVal
}

export function outerJoin<K, V1, V2>(v1: Map<K, V1>, v2: Map<K, V2>, defaultV1: V1, defaultV2: V2): Map<K, [V1, V2]> {
    const allKeys = [...new Set([ // unique keys
        ...v1.keys(),
        ...v2.keys()
    ]).values()]

    let map = new Map<K, [V1, V2]>()

    for (let key of allKeys) {
        map.set(key, [v1.get(key) || defaultV1, v2.get(key) || defaultV2])
    }

    return map
}

export function innerJoin<K, V1, V2>(v1: Map<K, V1>, v2: Map<K, V2>): Map<K, [V1, V2]> {
    const commonKeys = [...new Set([ // unique keys
        ...v1.keys(),
        ...v2.keys()
    ]).values()].filter(k => v1.has(k) && v2.has(k))

    let map = new Map<K, [V1, V2]>()

    for (let key of commonKeys) {
        map.set(key, [v1.get(key), v2.get(key)])
    }

    return map
}