<script lang="ts">
	import { countElements, categorize, isBalanced, randomEquation, toTex } from "./ChemicalEquations";
	import type { Molecule, Categories } from "./ChemicalEquations"
	import { toString as toStringMap } from "./MapLib";
	import { subscribe } from "svelte/internal";
	import Katex from "./Katex.svelte"
	export let name: string;

	let equation = randomEquation()

	function replaceAtIndex<T>(array: T[], index: number, value: T): T[] {
		let retVal = new Array<T>();
		
		for (let i = 0; i < array.length; i++){
			retVal[i] = (i === index) ? value : array[i]
		}

		return retVal
	}

	let categories: Categories
	$: categories = categorize(equation)

</script>

<main>
	<!-- reactant -->
	{#each equation.reactants as [coefficient, molecule], index}
		{#if index !== 0}
			<Katex math="+" />
		{/if}
		<input type="number" min="1" bind:value={coefficient} on:input={event => {
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
		}}>
		
		<Katex math={toTex(molecule)} />
	{/each}
	<Katex math={"\\rightarrow"} />
	<!-- product -->
	{#each equation.products as [coefficient, molecule], index}
		{#if index !== 0}
			<Katex math="+" />
		{/if}
		<input type="number" min="1" bind:value={coefficient} on:input={event => {
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
		}}> <Katex math={toTex(molecule)} />
	{/each}

	<ul>
		<li>Owed in products: {toStringMap(categories.owedInProducts)}</li>
		<li>Owed in reactants: {toStringMap(categories.owedInReactants)} </li>
		<li>In Both: {toStringMap(categories.inBoth)} </li>
	</ul>
	<p>
		Is balanced: {isBalanced(equation)}
	</p>

	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
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

	input[type="number"] {
		width: 50px;
	}
</style>