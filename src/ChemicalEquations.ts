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

export function compound(molecules: Molecule[], subscript = 1): Molecule {
    return {
        kind: 'Compound',
        molecules,
        subscript: subscript
    }
}

export function element(element: string, subscript = 1): Molecule {
    return {
        kind: 'Element',
        element,
        subscript: subscript
    }
}

// O2
const oxygen: Molecule = element('O', 2)

const water: Molecule = compound([element('H', 2), element('O')])

function H_2O(): Molecule {
    return compound([element('H', 2), element('O')])
}

type Equation = {
    reactants: [number, Molecule][]
    products: [number, Molecule][]
}

// ? H_2 + ? O_2 -->  ? H_2O
// 1 H_2 + 1 O_2 ---> 1 H_2O
// ...
// 2 H_2 + 1 O_2 --> 2 H_2O

export function equationWithCoefficient1(reactants: Molecule[], products: Molecule[]): Equation {
    return {
        // [number, Molecule][] = Molecule[]    <====> [number, Molecule] = Molecule
        reactants: reactants.map(reactant => [1, reactant]),
        products: products.map(product => [1, product])
    }
}

export function isBalanced(equation: Equation): boolean {
    const categories = categorize(equation)
    return categories.productsOwe.size === 0 && categories.reactantsOwe.size === 0
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


export type Categories = {
    reactantsOwe: Map<string, number>
    reactantsHave: Map<string, number>
    productsOwe: Map<string, number>
    productsHave: Map<string, number>
}

export function categorize(equation: Equation): Categories {
    const reactantsCount = merge(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient)))
    const productsCount = merge(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient)))

    return {
        reactantsHave: reactantsCount,
        productsHave: productsCount,
        productsOwe: filter(difference(reactantsCount, productsCount), x => x > 0),
        reactantsOwe: filter(difference(productsCount, reactantsCount), x => x > 0)
    }
}


export const examples: Equation[] = [
    equationWithCoefficient1([
        element('H', 2),
        element('O', 2)
    ], [
        H_2O()
    ]),

    equationWithCoefficient1([
        compound([
            element('C'),
            element('O', 2)
        ]),
        H_2O()
    ], [
        compound([
            element('C', 6),
            element('H', 12),
            element('O', 6)
        ]),
        element('O', 2)
    ]),

    equationWithCoefficient1([
        compound([
            element('H', 2),
            element('S'),
            element('O', 4)
        ]),
    
        compound([
            element('H'),
            element('I')
        ])
    ], [
        compound([element('H', 2), element('S')]),
        element('I', 2),
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


export function toTex(molecule: Molecule): string {
    return `\\mathrm{${toString(molecule)}}`
}

export function toString(molecule: Molecule): string {
    switch(molecule.kind){
        case "Element":
            return (molecule.subscript === 1) ? `${molecule.element}` : `${molecule.element}_{${molecule.subscript}}`
        case "Compound":
            return (molecule.subscript === 1) ? 
            `${molecule.molecules.map(molecule => toString(molecule)).join('')}`:
            `(${molecule.molecules.map(molecule => toString(molecule)).join('')})_{${molecule.subscript}}`
    }
}