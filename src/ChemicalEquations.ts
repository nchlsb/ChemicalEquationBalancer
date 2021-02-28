export type Molecule = {
    kind: 'Compound'
    molecules: Molecule[]
    subscript: number
} | {
    kind: 'Element'
    element: string
    subscript: number
}

export function makeCompound(molecules: Molecule[], subscript?: number): Molecule {
    return {
        kind: 'Compound',
        molecules,
        subscript: subscript || 1
    }
}

export function makeElement(element: string, subscript?: number): Molecule {
    return {
        kind: 'Element',
        element,
        subscript: subscript || 1
    }
}

// O2
let oxygen: Molecule = makeElement('O', 2)

let water: Molecule = makeCompound([makeElement('H', 2), makeElement('O')])

type Equation = {
    reactants: [number, Molecule][]
    products: [number, Molecule][]
}

export function isBalanced(equation: Equation): boolean {
    const reactanctsElements = equation.reactants.map(([coefficient, molecule]) =>map(
        countElements(molecule),
        element => element * coefficient
    ))

    const productsElements = equation.products.map(([coefficient, molecule]) =>map(
        countElements(molecule),
        element => element * coefficient
    ))

    return mapEquals(merge(reactanctsElements), merge(productsElements))
}

function mapEquals(a: Map<string, number>, b: Map<string, number>): boolean {
    return isSubset(a, b) && isSubset(b, a)
}

// a = {'brett': 20, 'nick': 30}
// b = {'brett': 20, 'nick': 30, 'cal': 40}
function isSubset(a: Map<string, number>, b: Map<string, number>): boolean {
    for (let key of a.keys()) {
        if (!b.has(key) || a.get(key) !== b.get(key))
            return false
    }

    return true
}

// map (on Array) :::: map :: (a -> b) -> (List)<a>   -> (List)<b>
// map (on Map<K, V>)  map :: (a -> b) -> (Map<K>)<a> -> (Map<K>)<b>
// map (on Maybe)      map :: (a -> b) -> (Maybe)<a>  -> (Maybe)<b>
// map :: (a -> b) -> F<a> -> F<b>

// 2 * H20 = 2 * {H: 2, O: 1} => {H: 2 * 2, O: 1 * 2}
// H: 4
// O: 2
export function countElements(molecule: Molecule): Map<string, number> {
    switch(molecule.kind) {
        case "Element":
            return new Map([[molecule.element, molecule.subscript]])
        case "Compound":
            return map(
                merge(molecule.molecules.map(innerMolecule => countElements(innerMolecule))),
                v => v * molecule.subscript
            );
    }
}

function merge(maps: Map<string, number>[]): Map<string, number> {
    let retVal = new Map<string, number>();
    maps.forEach(map => {
        map.forEach((value, key) => {
            retVal.set(key, value + (retVal.get(key) || 0))
        })
    })

    return retVal
}

export function map<K, A, B>(map: Map<K, A>, f: (a: A) => B): Map<K, B> {
    let retVal = new Map<K, B>();
    map.forEach((value, key) => {
        retVal.set(key, f(value))
    })

    return retVal;
}