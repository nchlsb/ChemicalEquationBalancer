export type Multiset<T> = {
    implementation: Map<T, number>
}

export function Multiset<T>(array: T[]): Multiset<T> {
    switch(array.length){
        case 0:
            return {implementation: new Map<T, number>()}
        default:
            const [first, ...rest] = array
            return sum(
                {implementation: new Map<T, number>([[first, 1]])},
                Multiset(rest)
            )
    }
}

export function isSubset<T>(a: Multiset<T>, b: Multiset<T>): boolean {
    return universe(a, b).every(x => count(a, x) <= count(b, x))
}

export function intersection<T>(a: Multiset<T>, b: Multiset<T>): Multiset<T> {
    return {
        implementation: new Map(universe(a, b).map(x =>
            [x, Math.min(count(a, x), count(b, x))]
        ))
    }
}

export function union<T>(a: Multiset<T>, b: Multiset<T>): Multiset<T> {
    return {
        implementation: new Map(universe(a, b).map(x =>
            [x, Math.max(count(a, x), count(b, x))]
        ))
    }
}

export function sum<T>(a: Multiset<T>, b: Multiset<T>) {
    return {
        implementation: new Map(universe(a, b).map(x =>
            [x, count(a, x) + count(b, x)]
        ))
    }
}

export function count<T>(multiset: Multiset<T>, element: T): number {
    return multiset.implementation.has(element) ? multiset.implementation.get(element) : 0
}

function universe<T>(a: Multiset<T>, b: Multiset<T>): T[] {
    return [...new Set([
        ...a.implementation.keys(),
        ...b.implementation.keys()
    ]).values()]
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