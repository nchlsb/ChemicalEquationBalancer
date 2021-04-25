export type Multiset<T> = {
    elements: Map<T, number>
}

export function Multiset<T>(array: T[]): Multiset<T> {
    switch(array.length){
        case 0:
            return empty()
        default:
            const [first, ...rest] = array
            return sum(singleton(first), Multiset(rest))
    }
}

export function singleton<T>(element: T, amount = 1): Multiset<T> {
    return {elements: new Map<T, number>([[element, amount]])}
}

export function empty<T>(): Multiset<T> {
    return {elements: new Map<T, number>()}
}

export function isSubset<T>(a: Multiset<T>, b: Multiset<T>): boolean {
    return universe(a, b).every(x => count(a, x) <= count(b, x))
}

export function intersection<T>(a: Multiset<T>, b: Multiset<T>): Multiset<T> {
    return {
        elements: new Map(universe(a, b).map(x =>
            [x, Math.min(count(a, x), count(b, x))]
        ))
    }
}

export function union<T>(a: Multiset<T>, b: Multiset<T>): Multiset<T> {
    return {
        elements: new Map(universe(a, b).map(x =>
            [x, Math.max(count(a, x), count(b, x))]
        ))
    }
}

export function sum<T>(a: Multiset<T>, b: Multiset<T>) {
    return {
        elements: new Map(universe(a, b).map(x =>
            [x, count(a, x) + count(b, x)]
        ))
    }
}

export function sumAll<T>(array: Multiset<T>[]): Multiset<T> {
    switch (array.length) {
        case 0: 
            return empty()
        default:
            const [first, ...rest] = array
            return sum(first, sumAll(rest))
    }
}

export function difference<T>(a: Multiset<T>, b: Multiset<T>) {
    const UnivrseA = universe(a, b).map(x =>[x, count(a, x) - count(b, x)] as [T,number])
    return {
        elements: new Map(UnivrseA.filter(([a,b]) => b > 0))
    }
}

export function multiplyCounts<T>(n: number, multiset: Multiset<T>): Multiset<T> {
    return {
        elements: new Map<T, number>([...multiset.elements.entries()]
            .map(([k, v]) => [k, v * n]))
    }
}

export function count<T>(multiset: Multiset<T>, element: T): number {
    return multiset.elements.has(element) ? multiset.elements.get(element) : 0
}

export function isEmpty<T>(multiset: Multiset<T>){
    return multiset.elements.size === 0;
}

function universe<T>(a: Multiset<T>, b: Multiset<T>): T[] {
    return [...new Set([
        ...a.elements.keys(),
        ...b.elements.keys()
    ]).values()]
}

export function toStringMultiset<T>(multiset: Multiset<T>){
    return `{ ${[...multiset.elements.entries()].map(([k, v]) => `${k}: ${v}`).join(', ')} }`
}

/*
C: 
struct Brett {
    int x;
    int y;
    struct Nick {
        int z;
    } foo;
}

return (struct Brett) {
    .x = 12,
    .y = 13,
    .foo = (struct Nick) {
        .z = 4
    }
}

Haskell
data Cal = Cal {
    name :: String,
    age :: Integer,
    favoriteColor :: String
}

changeName :: Cal -> Cal
changeName x = x {name = "Brett"}
*/