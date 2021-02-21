import { countElements, makeElement, makeMolecule, isBalanced } from '../src/ChemicalEquations';
import { assert, expect } from 'chai';
import 'mocha';

describe("countElements", () => {
  it("should count 2 hydrogens and 1 oxygen in water", () => {
    const water = makeMolecule([makeElement('H', 2), makeElement('O')])
    const result = countElements(water)
    // expect(result.get('H')).to.equal(2)

    assert(result.get('H') === 2 && result.get('O') === 1)
  });

  it("should count 2 iron, 3 sulfur, and 12 oxygen in Iron(III) sulfate", () => {
    const iron3Sulfate = makeMolecule([
        makeElement('Fe', 2), makeMolecule([makeElement('S'), makeElement('O', 4)], 3)
    ])
    const result = countElements(iron3Sulfate)

    assert(
        result.get('Fe') === 2 &&
        result.get('S') === 3 &&
        result.get('O') === 12
    )
  });
})

describe("isBalanced", () => {
  it("2H_2O -> 2H_2 + O_2", () => {
    expect(isBalanced({
      reactants: [[2, makeMolecule([makeElement('H', 2), makeElement('O')])]],
      products:  [[2, makeElement('H', 2)], [1, makeElement('O', 2)]]
    })).to.be.true;
  });
})
