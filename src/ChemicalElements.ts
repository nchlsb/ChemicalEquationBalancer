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

export function atomicNumber(element: ChemicalElement): number {
    switch(element){
        case "H" : return 1	
        case "He": return 2 		
        case "Li": return 3 		
        case "Be": return 4 		
        case "B" : return 5 	
        case "C" : return 6 	
        case "N" : return 7 	
        case "O" : return 8 	
        case "F" : return 9 	
        case "Ne": return 10 		
        case "Na": return 11 		
        case "Mg": return 12 		
        case "Al": return 13 		
        case "Si": return 14 		
        case "P" : return 15 	
        case "S" : return 16 	
        case "Cl": return 17 		
        case "Ar": return 18 		
        case "K" : return 19 	
        case "Ca": return 20 		
        case "Sc": return 21 		
        case "Ti": return 22 		
        case "V" : return 23 	
        case "Cr": return 24 		
        case "Mn": return 25 		
        case "Fe": return 26 		
        case "Co": return 27 		
        case "Ni": return 28 		
        case "Cu": return 29 		
        case "Zn": return 30 		
        case "Ga": return 31 		
        case "Ge": return 32 		
        case "As": return 33 		
        case "Se": return 34 		
        case "Br": return 35 		
        case "Kr": return 36 		
        case "Rb": return 37 		
        case "Sr": return 38 		
        case "Y" : return 39 	
        case "Zr": return 40 		
        case "Nb": return 41 		
        case "Mo": return 42 		
        case "Tc": return 43 		
        case "Ru": return 44 		
        case "Rh": return 45 		
        case "Pd": return 46 		
        case "Ag": return 47 		
        case "Cd": return 48 		
        case "In": return 49 		
        case "Sn": return 50 		
        case "Sb": return 51 		
        case "Te": return 52 		
        case "I" : return 53 	
        case "Xe": return 54 		
        case "Cs": return 55 		
        case "Ba": return 56 		
        case "La": return 57 		
        case "Ce": return 58 		
        case "Pr": return 59 			
        case "Nd": return 60 		
        case "Pm": return 61 		
        case "Sm": return 62 		
        case "Eu": return 63 		
        case "Gd": return 64 		
        case "Tb": return 65 		
        case "Dy": return 66 		
        case "Ho": return 67 		
        case "Er": return 68 		
        case "Tm": return 69 		
        case "Yb": return 70 		
        case "Lu": return 71 		
        case "Hf": return 72 		
        case "Ta": return 73 		
        case "W" : return  74 	
        case "Re": return 75 		
        case "Os": return 76 		
        case "Ir": return 77 		
        case "Pt": return 78 		
        case "Au": return 79 		
        case "Hg": return 80 		
        case "Tl": return 81 		
        case "Pb": return 82 		
        case "Bi": return 83 		
        case "Po": return 84 		
        case "At": return 85 		
        case "Rn": return 86 		
        case "Fr": return 87 		
        case "Ra": return 88 		
        case "Ac": return 89 		
        case "Th": return 90 		
        case "Pa": return 91 			
        case "U" : return 92 	
        case "Np": return 93 		
        case "Pu": return 94 		
        case "Am": return 95 		
        case "Cm": return 96 		
        case "Bk": return 97 		
        case "Cf": return 98 		
        case "Es": return 99 		
        case "Fm": return 100 	
        case "Md": return 101 	
        case "No": return 102 	
        case "Lr": return 103 	
        case "Rf": return 104 		
        case "Db": return 105 	
        case "Sg": return 106 	
        case "Bh": return 107 	
        case "Hs": return 108 	
        case "Mt": return 109 	
        case "Ds": return 110 	
        case "Rg": return 111 	
    }
}

// 1 	H 	Hydrogen
// 2 	He 	Helium
// 3 	Li 	Lithium
// 4 	Be 	Beryllium
// 5 	B 	Boron
// 6 	C 	Carbon
// 7 	N 	Nitrogen
// 8 	O 	Oxygen
// 9 	F 	Fluorine
// 10 	Ne 	Neon
// 11 	Na 	Sodium
// 12 	Mg 	Magnesium
// 13 	Al 	Aluminum
// 14 	Si 	Silicon
// 15 	P 	Phosphorus
// 16 	S 	Sulfur
// 17 	Cl 	Chlorine 	
// 18 	Ar 	Argon
// 19 	K 	Potassium 	
// 20 	Ca 	Calcium 	
// 21 	Sc 	Scandium 	
// 22 	Ti 	Titanium 	
// 23 	V 	Vanadium 	
// 24 	Cr 	Chromium 	
// 25 	Mn 	Manganese 	
// 26 	Fe 	Iron
// 27 	Co 	Cobalt 
// 28 	Ni 	Nickel
// 29 	Cu 	Copper
// 30 	Zn 	Zinc 			
// 31 	Ga 	Gallium 		
// 32 	Ge 	Germanium 		
// 33 	As 	Arsenic 		
// 34 	Se 	Selenium 		
// 35 	Br 	Bromine 		
// 36 	Kr 	Krypton 		
// 37 	Rb 	Rubidium 		
// 38 	Sr 	Strontium 		
// 39 	Y 	Yttrium 		
// 40 	Zr 	Zirconium 		
// 41 	Nb 	Niobium 		
// 42 	Mo 	Molybdenum 		
// 43 	Tc 	Technetium 		
// 44 	Ru 	Ruthenium 		
// 45 	Rh 	Rhodium 		
// 46 	Pd 	Palladium 		
// 47 	Ag 	Silver 			
// 48 	Cd 	Cadmium 		
// 49 	In 	Indium 			
// 50 	Sn 	Tin 			
// 51 	Sb 	Antimony 		
// 52 	Te 	Tellurium 		
// 53 	I 	Iodine 			
// 54 	Xe 	Xenon 			
// 55 	Cs 	Cesium 			
// 56 	Ba 	Barium 			
// 57 	La 	Lanthanum 		
// 58 	Ce 	Cerium 			
// 59 	Pr 	Praseodymium 	
// 60 	Nd 	Neodymium 		
// 61 	Pm 	Promethium 		
// 62 	Sm 	Samarium 		
// 63 	Eu 	Europium 		
// 64 	Gd 	Gadolinium 		
// 65 	Tb 	Terbium
// 66 	Dy 	Dysprosium 		
// 67 	Ho 	Holmium 		
// 68 	Er 	Erbium 			
// 69 	Tm 	Thulium 		
// 70 	Yb 	Ytterbium 		
// 71 	Lu 	Lutetium 		
// 72 	Hf 	Hafnium 		
// 73 	Ta 	Tantalum 		
// 74 	W 	Tungsten 		
// 75 	Re 	Rhenium 		
// 76 	Os 	Osmium 			
// 77 	Ir 	Iridium 		
// 78 	Pt 	Platinum 		
// 79 	Au 	Gold 			
// 80 	Hg 	Mercury 		
// 81 	Tl 	Thallium 		
// 82 	Pb 	Lead 			
// 83 	Bi 	Bismuth 		
// 84 	Po 	Polonium 		
// 85 	At 	Astatine 		
// 86 	Rn 	Radon 			
// 87 	Fr 	Francium 		
// 88 	Ra 	Radium 			
// 89 	Ac 	Actinium 		
// 90 	Th 	Thorium
// 91 	Pa 	Protactinium 	
// 92 	U 	Uranium 		
// 93 	Np 	Neptunium 		
// 94 	Pu 	Plutonium 		
// 95 	Am 	Americium 		
// 96 	Cm 	Curium 			
// 97 	Bk 	Berkelium 		
// 98 	Cf 	Californium 	
// 99 	Es 	Einsteinium 	
// 100 Fm 	Fermium 		
// 101 Md 	Mendelevium 	
// 102 No 	Nobelium 		
// 103 Lr 	Lawrencium 		
// 104 Rf 	Rutherfordium 	
// 105 Db 	Dubnium 		
// 106 Sg 	Seaborgium 		
// 107 Bh 	Bohrium 		
// 108 Hs 	Hassium 		
// 109 Mt 	Meitnerium
// 110 Ds 	Darmstadtium
// 111 Rg 	Roentgenium
// 112 Uub