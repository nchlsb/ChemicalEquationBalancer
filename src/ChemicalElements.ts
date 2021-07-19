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

export function H_2O(): Molecule {
    return compound([element('H', 2), element('O')])
}

export type ChemicalElement = 
    "Ac" |
    "Al" |
    "Am" |
    "Sb" |
    "Ar" |
    "As" |
    "At" |
    "Ba" |
    "Bk" |
    "Be" |
    "Bi" |
    "Bh" |
    "B"  |
    "Br" |
    "Cd" |
    "Ca" |
    "Cf" |
    "C"  |
    "Ce" |
    "Cs" |
    "Cl" |
    "Cr" |
    "Co" |
    "Cn" |
    "Cu" |
    "Cm" |
    "Ds" |
    "Db" |
    "Dy" |
    "Es" |
    "Er" |
    "Eu" |
    "Fm" |
    "Fl" |
    "F"  |
    "Fr" |
    "Gd" |
    "Ga" |
    "Ge" |
    "Au" |
    "Hf" |
    "Hs" |
    "He" |
    "Ho" |
    "H"  |
    "In" |
    "I"  |
    "Ir" |
    "Fe" |
    "Kr" |
    "La" |
    "Lr" |
    "Pb" |
    "Li" |
    "Lv" |
    "Lu" |
    "Mg" |
    "Mn" |
    "Mt" |
    "Md" |
    "Hg" |
    "Mo" |
    "Mc" |
    "Nd" |
    "Ne" |
    "Np" |
    "Ni" |
    "Nh" |
    "Nb" |
    "N"  |
    "No" |
    "Og" |
    "Os" |
    "O"  |
    "Pd" |
    "P"  |
    "Pt" |
    "Pu" |
    "Po" |
    "K"  |
    "Pr" |
    "Pm" |
    "Pa" |
    "Ra" |
    "Rn" |
    "Re" |
    "Rh" |
    "Rg" |
    "Rb" |
    "Ru" |
    "Rf" |
    "Sm" |
    "Sc" |
    "Sg" |
    "Se" |
    "Si" |
    "Ag" |
    "Na" |
    "Sr" |
    "S"  |
    "Ta" |
    "Tc" |
    "Te" |
    "Ts" |
    "Tb" |
    "Tl" |
    "Th" |
    "Tm" |
    "Sn" |
    "Ti" |
    "W"  |
    "U"  |
    "V"  |
    "Xe" |
    "Yb" |
    "Y"  |
    "Zn" |
    "Zr" 

export function atomicNumber(x: ChemicalElement): number {
    return undefined
}