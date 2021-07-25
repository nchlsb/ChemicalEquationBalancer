import { ChemicalElement, compound, element, H_2O, Molecule } from "./ChemicalElements"
import { outerJoin, randomIntegerUpTo } from "./helpers"
import { equals, multiplyCounts, singleton, sumAll, toMap } from './BagAdapter'
import type { Bag } from 'typescript-collections'

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

// map (on Array) :::: map :: (a -> b) -> (List)<a>   -> (List)<b>
// map (on Map<K, V>)  map :: (a -> b) -> (Map<K>)<a> -> (Map<K>)<b>
// map (on Maybe)      map :: (a -> b) -> (Maybe)<a>  -> (Maybe)<b>
// map :: (a -> b) -> F<a> -> F<b>

// 2 * H20 = 2 * {H: 2, O: 1} => {H: 2 * 2, O: 1 * 2}
// H: 4
// O: 2
export function countElements(molecule: Molecule, coefficient = 1): Bag<ChemicalElement> {
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

export function atomsPerElementOnEquationSide(equation: Equation): Map<ChemicalElement, [number, number]> {
	const reactants = toMap(sumAll(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient))))
	const products = toMap(sumAll(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient))))

    return outerJoin(reactants, products, 0, 0)
}

// f : [Map<A, B>, Map<A, C>] --> [Map<A, [B, C]>]

export function isBalanced(equation: Equation): boolean {
    return equals(reactantAtoms(equation), productAtoms(equation))
}

// [Map<A, B>, Map<A, C>]                 <====> Map<A, [B, C]>
// ^ Multiset p, ^ Multiset r             <====> Map<A, Counts>


export function reactantAtoms(equation: Equation): Bag<ChemicalElement> {
    return sumAll(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient)))
}

export function productAtoms(equation: Equation): Bag<ChemicalElement> {
    return sumAll(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient)))
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
    return examples[randomIntegerUpTo(examples.length)]
    //return examples[0]
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
