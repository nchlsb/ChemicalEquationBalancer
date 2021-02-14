type Molecule = {
    kind: 'List'
    molecules: Molecule[]
    subscript: number
} | {
    kind: 'Element'
    element: string
    subscript: number
}

export function makeList(molecules: Molecule[], subscript?: number): Molecule {
    return {
        kind: 'List',
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

let water: Molecule = makeList([makeElement('H', 2), makeElement('O')])

type Equation = {
    reactants: [number, Molecule][]
    products: [number, Molecule][]
}

// 2 * H20 = 2 * {H: 2, O: 1} => {H: 2 * 2, O: 1 * 2}
// H: 4
// O: 2
export function countElements(molecule: Molecule): Map<string, number> {
    switch(molecule.kind) {
        case "Element":
            return new Map([[molecule.element, molecule.subscript]])
        case "List":
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

function map<K, A, B>(map: Map<K, A>, f: (a: A) => B): Map<K, B> {
    let retVal = new Map<K, B>();
    map.forEach((value, key) => {
        retVal.set(key, f(value))
    })

    return retVal;
}