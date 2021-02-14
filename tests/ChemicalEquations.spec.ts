import { countElements, makeElement, makeList } from '../src/ChemicalEquations';
import { assert, expect } from 'chai';
import 'mocha';

describe("countElements", () => {
  it("should count 2 hydrogens and 1 oxygen in water", () => {
    const water = makeList([makeElement('H', 2), makeElement('O')])
    const result = countElements(water)
    // expect(result.get('H')).to.equal(2)

    assert(result.get('H') === 2 && result.get('O') === 1)
  });

  it("should count 2 iron, 3 sulfur, and 12 oxygen in Iron(III) sulfate", () => {
    const iron3Sulfate = makeList([
        makeElement('Fe', 2), makeList([makeElement('S'), makeElement('O', 4)], 3)
    ])
    const result = countElements(iron3Sulfate)

    assert(
        result.get('Fe') === 2 &&
        result.get('S') === 3 &&
        result.get('O') === 12
    )
  });
})
