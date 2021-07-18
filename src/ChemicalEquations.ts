import type { ChemicalElement } from "./ChemicalElements"
import { outerJoin, randomIntegerUpTo } from "./helpers"
import { multiplyCounts, Multiset, singleton, sumAll, equals, intersection, difference, isEmpty} from './Multiset'


export type Molecule = {
    kind: 'Compound'
    molecules: Molecule[]
    subscript: number
} | {
    kind: 'Element'
    element: ChemicalElement
    subscript: number
}

export function compound(molecules: Molecule[], subscript = 1): Molecule {
    return {
        kind: 'Compound',
        molecules,
        subscript: subscript
    }
}

export function element(element: ChemicalElement, subscript = 1): Molecule {
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

export type Equation = {
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

// export function isBalanced(equation: Equation): boolean {
//     const categories = categorize(equation)
//     return isEmpty(categories.owedInReactants) && isEmpty(categories.owedInProducts)
// }

// map (on Array) :::: map :: (a -> b) -> (List)<a>   -> (List)<b>
// map (on Map<K, V>)  map :: (a -> b) -> (Map<K>)<a> -> (Map<K>)<b>
// map (on Maybe)      map :: (a -> b) -> (Maybe)<a>  -> (Maybe)<b>
// map :: (a -> b) -> F<a> -> F<b>

// 2 * H20 = 2 * {H: 2, O: 1} => {H: 2 * 2, O: 1 * 2}
// H: 4
// O: 2
export function countElements(molecule: Molecule, coefficient = 1): Multiset<ChemicalElement> {
    switch(molecule.kind) {
        case "Element":
            return singleton(molecule.element, molecule.subscript * coefficient)
            
        case "Compound":
            return multiplyCounts(molecule.subscript * coefficient,
                sumAll(molecule.molecules.map(x => countElements(x))))
    }
}

// How do you count an equation?
// Multiset<Reactants> === Multiset<Products> ?

// totalAtomsPerMolecule? 
export function atomsPerElementOnEquationSide(equation: Equation): Map<ChemicalElement, [number, number]> {
	const reactants = sumAll(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient))).elements
	const products = sumAll(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient))).elements

    return outerJoin(reactants, products, 0, 0)
}

// f : [Map<A, B>, Map<A, C>] --> [Map<A, [B, C]>]



export function isBalanced3(equation: Equation): boolean {
    const atomsInReactants: Map<ChemicalElement, number> = undefined
    const atomsInProducts: Map<ChemicalElement, number> = undefined


     // ~ does r/ have the same total count of atoms for each element as p/ 
    const atoms: Iterable<ChemicalElement> = undefined
    for (const atom of atoms) {
        if (
            !atomsInReactants.has(atom) || !atomsInProducts.has(atom) ||
            atomsInReactants.get(atom) !== atomsInProducts.get(atom)
        ) {
            return false
        }
    }

    return true
}

export function isBalanced(equation: Equation): boolean {
    const reactants = sumAll(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient))).elements
	const products = sumAll(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient))).elements

    const atomsInReactants: Map<ChemicalElement, number> = sumAll(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient))).elements
    const atomsInProducts: Map<ChemicalElement, number> = sumAll(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient))).elements

     // ~ does r/ have the same total count of atoms for each element as p/ 
    const atoms: Array<ChemicalElement> = [ ...new Set([
        ...atomsInReactants.keys(),
        ...atomsInProducts.keys()
    ])]

    return atoms.every(atom =>
        atomsInReactants.has(atom) &&
        atomsInProducts.has(atom) &&
        atomsInReactants.get(atom) === atomsInProducts.get(atom)
    )
}

// [Map<A, B>, Map<A, C>]                 <====> Map<A, [B, C]>
// ^ Multiset p, ^ Multiset r             <====> Map<A, Counts>


export function isBalanced5(equation: Equation): boolean {
    return equals(reactantAtoms(equation), productAtoms(equation))
}

function reactantAtoms(equation: Equation): Multiset<ChemicalElement> {
    return sumAll(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient)))
}

function productAtoms(equation: Equation): Multiset<ChemicalElement> {
    return sumAll(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient)))
}

// 4-tuple (Bool, Bool, Bool, Bool) = 2^4 = 16 
// 3-tuple (Bool, Bool, Bool) = 2^3 =      8 !== 16 (Int -> (Infinite in 2 directions)) (Natural number -> (Infinite in 1 direction)) string.charAt(Natural)

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
    ]),

    equationWithCoefficient1([
        compound([
            element('S', 2),
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
    ]),

    equationWithCoefficient1([
        compound([
            element('S', 2),
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
    ]),

    equationWithCoefficient1([
        element('S', 8),
        element('F', 2),
    ], [
        compound([element('S'), element('F', 6)])
    ]), 

    equationWithCoefficient1([
        element('Al', 2),
        compound([element('C'), element('O', 3)], 3),
        compound([element('H', 3), element('P'), element('P'), element('O', 4)])
    ], [
        compound([element('Al'), element('P'), element('O', 4)]),
        compound([element('C'), element('O', 2)]),
        H_2O()
    ])
]

export function randomEquation(): Equation {
    //return examples[randomIntegerUpTo(examples.length)]
    return examples[0]
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


export function toTex(molecule: Molecule, coefficient = 1): string {
    return `${((coefficient === 1) ? "" : coefficient)}\\mathrm{${toString(molecule)}}`
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

