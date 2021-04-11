import { countElements, element, compound, isBalanced } from '../src/ChemicalEquations';
import { assert, expect } from 'chai';
import 'mocha';
import { difference, toString } from '../src/MapLib';

describe("countElements", () => {
  it("should count 2 hydrogens and 1 oxygen in water", () => {
    const water = compound([element('H', 2), element('O')])
    const result = countElements(water)
    // expect(result.get('H')).to.equal(2)

    assert(result.get('H') === 2 && result.get('O') === 1)
  });

  it("should count 2 iron, 3 sulfur, and 12 oxygen in Iron(III) sulfate", () => {
    const iron3Sulfate = compound([
        element('Fe', 2), compound([element('S'), element('O', 4)], 3)
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
      reactants: [[2, compound([element('H', 2), element('O')])]],
      products:  [[2, element('H', 2)], [1, element('O', 2)]]
    })).to.be.true;
  });
})

const a = new Map([['x', 12], ['y', 3], ['w', 10]])
const b = new Map([['x', 10], ['y', 5], ['z', 20], ['w', 10]])
const result = new Map([['x', 2], ['y', -2], ['z', -20], ['w', 0]])

describe("differnce", () => {
  it(`difference(${toString(a)}, ${toString(b)}) === ${toString(result)}`, () => {

    expect(difference(a, b)).to.deep.equals(result, `expected ${toString(difference(a, b))} to deeply equal ${toString(result)}`)
  });
});
