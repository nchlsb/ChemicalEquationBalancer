import { difference, filter, map, merge } from './MapLib'

export type Molecule = {
    kind: 'Compound'
    molecules: Molecule[]
    subscript: number
} | {
    kind: 'Element'
    element: string
    subscript: number
}

export function makeCompound(molecules: Molecule[], subscript = 1): Molecule {
    return {
        kind: 'Compound',
        molecules,
        subscript: subscript
    }
}

export function makeElement(element: string, subscript = 1): Molecule {
    return {
        kind: 'Element',
        element,
        subscript: subscript
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
    return findImbalance(equation).size === 0
}

// map (on Array) :::: map :: (a -> b) -> (List)<a>   -> (List)<b>
// map (on Map<K, V>)  map :: (a -> b) -> (Map<K>)<a> -> (Map<K>)<b>
// map (on Maybe)      map :: (a -> b) -> (Maybe)<a>  -> (Maybe)<b>
// map :: (a -> b) -> F<a> -> F<b>

// 2 * H20 = 2 * {H: 2, O: 1} => {H: 2 * 2, O: 1 * 2}
// H: 4
// O: 2
export function countElements(molecule: Molecule, coefficient = 1): Map<string, number> {
    switch(molecule.kind) {
        case "Element":
            return map(new Map([[molecule.element, molecule.subscript]]), v => v * coefficient)
        case "Compound":
            return map(
                merge(molecule.molecules.map(innerMolecule => countElements(innerMolecule))),
                v => v * molecule.subscript * coefficient
            );
    }
}

// Map Law !!
// map(map(xs, f), g) === map(xs, g . f)
// xs.map(f).map(g) === xs.map(x => g(f(x)))
export function findImbalance(equation: Equation): Map<string, number> {
    const reactantsCount = merge(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient)))
    const productsCount = merge(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient)))

    return filter(difference(reactantsCount, productsCount), elementCount => elementCount !== 0)
}


export const examples: Equation[] = [
    equationWithCoefficient1([
        makeElement('H', 2),
        makeElement('O', 2)
    ], [
        H_2O()
    ]),

    equationWithCoefficient1([
        makeCompound([
            makeElement('C'),
            makeElement('O', 2)
        ]),
        H_2O()
    ], [
        makeCompound([
            makeElement('C', 6),
            makeElement('H', 12),
            makeElement('O', 6)
        ]),
        makeElement('O', 2)
    ]),

    equationWithCoefficient1([
        makeCompound([
        makeElement('H', 2),
            makeElement('S'),
            makeElement('O', 4)
        ]),
    
        makeCompound([
            makeElement('H'),
            makeElement('I')
        ])
    ], [
        makeCompound([makeElement('H', 2), makeElement('S')]),
        makeElement('I', 2),
        H_2O()
    ])
]

export function randomEquation(): Equation {
    return examples[randomIntegerUpTo(examples.length)]
}

function randomIntegerUpTo(max: number): number {
    const between0and1 = Math.random()
    const floatBetween0andMax = between0and1 * max
    return Math.floor(floatBetween0andMax)
}

// CO2 + H2O → C6H12O6 + O2
// SiCl4 + H2O → H4SiO4 + HCl
// Al + HCl → AlCl3 + H2
// Na2CO3 + HCl → NaCl + H2O + CO2
// C7H6O2 + O2 → CO2 + H2O
// Fe2(SO4)3 + KOH → K2SO4 + Fe(OH)3
// Ca(PO4)2 + SiO2 → P4O10 + CaSiO3
// KClO3 → KClO4 + KCl
// Al2(SO4)3 + Ca(OH)2 → Al(OH)3 + CaSO4
// H2SO4 + HI → H2S + I2 + H2O

