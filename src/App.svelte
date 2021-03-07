<script lang="ts">
	import { countElements, findImbalance, isBalanced, randomEquation } from "./ChemicalEquations";
	import type { Molecule } from "./ChemicalEquations"
	import { toString as toStringMap } from "./MapLib";
import { subscribe } from "svelte/internal";
	export let name: string;

	let equation = randomEquation()

	function replaceAtIndex<T>(array: T[], index: number, value: T): T[] {
		let retVal = new Array<T>();
		
		for (let i = 0; i < array.length; i++){
			retVal[i] = (i === index) ? value : array[i]
		}

		return retVal
	}

	function toString(molecule: Molecule): string {
		switch(molecule.kind){
			case "Element":
				return (molecule.subscript === 1) ? `${molecule.element}` : `${molecule.element}_${molecule.subscript}`
			case "Compound":
				return (molecule.subscript === 1) ? 
				`${molecule.molecules.map(molecule => toString(molecule)).join('')}`:
				`(${molecule.molecules.map(molecule => toString(molecule)).join('')})_${molecule.subscript}`
		}
	}
</script>

<main>
	<!-- reactant -->
	{#each equation.reactants as [coefficient, molecule], index}
		<p><input type="number" min="1" bind:value={coefficient} on:input={event => {
			equation = {
				reactants: replaceAtIndex(
					equation.reactants,
					index,
					[
						parseInt(event.currentTarget.value),
						molecule
					]
				),
				products: equation.products
			}
		}}> {toString(molecule)}</p>
	{/each}
	-->
	<!-- product -->
	{#each equation.products as [coefficient, molecule], index}
		<p><input type="number" min="1" bind:value={coefficient} on:input={event => {
			equation = {
				products: replaceAtIndex(
					equation.products,
					index,
					[
						parseInt(event.currentTarget.value),
						molecule
					]
				),
				reactants: equation.reactants
			}
		}}> {toString(molecule)}</p>
	{/each}

	<p>
		{toStringMap(findImbalance(equation))}
	</p>
	<p>
		Is balanced: {isBalanced(equation)}
	</p>

	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>