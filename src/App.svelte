<script lang="ts">
	import type { Counts, element, Equation } from "./ChemicalEquations"; 
	import { build, randomEquation, toTex, countElements, isBalanced } from "./ChemicalEquations";
	import { count, difference, intersection, isEmpty, Multiset, sumAll, toStringMultiset } from "./Multiset"
	import Katex from "./Katex.svelte"
	import type { ChemicalElement } from "./ChemicalElements";	
	import { replaceAtIndex } from "./helpers";

	let equation = randomEquation()

	let map: Map<ChemicalElement, Counts>
	$: map = build(equation)

	function withReactantCoefficientAtIndex(index: number, newCoefficient: number): Equation {
		const [_, molecule] = equation.reactants[index]

		return {
				reactants: replaceAtIndex(
					equation.reactants,
					index,
					[newCoefficient, molecule]
				),

				products: equation.products
			}
	}

	function withProductCoefficientAtIndex(index: number, newCoefficient: number): Equation {
		const [_, molecule] = equation.products[index]

		return {
				products: replaceAtIndex(
					equation.products,
					index,
					[newCoefficient, molecule]
				),

				reactants: equation.reactants
			}
	}

	let orderedEntries: [ChemicalElement, Counts][]
	$: orderedEntries = [...map.entries()].sort(([a, _], [b, __]) => {
		if (a < b) {
			return -1
		} else if (a === b) {
			return 0
		} else {
			return 1
		}
	})

	type Spacing = {reactants: number, width: number, products: number}

	let widths: [ChemicalElement, Counts, Spacing][]
	$: widths = orderedEntries.map(([element, counts]) => {
		const totalElements = counts.amountInProducts + counts.amountInReactants
		const w = 5 // percent
		return [element, counts, {
			reactants: (100 - w) * counts.amountInReactants / totalElements,
			width: w,
			products: (100 - w) * counts.amountInProducts / totalElements
		}]
	})
</script>

<main>
	<table id="reactants-and-prodcuts">
		<tr>
			<td id="reactants-expression">
				{#each equation.reactants as [coefficient, molecule], index}		
					{#if index !== 0}
						<Katex math="+" />
					{/if}
					<input type="number" min="1" bind:value={coefficient} on:input={event => {
						equation = withReactantCoefficientAtIndex(index, parseInt(event.currentTarget.value))
					}}>
					
					<Katex math={toTex(molecule)} />
				{/each}
			</td>
			<td id="arrow">
				<Katex math={"\\rightarrow"} />
			</td>
			<td id="products-expression">
				{#each equation.products as [coefficient, molecule], index}
		
					{#if index !== 0}
						<Katex math="+" />
					{/if}
					<input type="number" min="1" bind:value={coefficient} on:input={event =>
						equation = withProductCoefficientAtIndex(index, parseInt(event.currentTarget.value))
					}> <Katex math={toTex(molecule)} />
				{/each}
			</td>
		</tr>
		{#each widths as [element, counts, {reactants, width, products}]}
		<tr id="equation-balance">
			<td class="reactants-count">
				<Katex math={counts.amountInReactants.toString()} displayMode={false}></Katex>
			</td>
			<td class="element-symbol">
				<div><div class="x" style="width: {products}%"></div><div class="w" style="width: {width}%"><Katex math={`\\mathrm{${element}}`} displayMode={false}></Katex></div><div class="y" style="width: {reactants}%"></div></div>
			</td>
			<td class="products-count">
				<Katex math={counts.amountInProducts.toString()} displayMode={false}></Katex>
			</td>
		</tr>
		{/each}
	</table>
</main>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	input[type="number"] {
		width: 50px;
	}
	
	.has-bar {
		fill: black;
	}

	.owed-bar {
		fill: white;
	}

	.brett {
		outline: 3px solid black;
	}

	#reactants-expression, .reactants-bar, .reactants-count {
		text-align: right;
	}

	#arrow, .element-symbol {
		text-align: center;
	}

	#products-expression, .products-bar, .products-count {
		text-align: left;
	}

	#reactants-expression, #products-expression {
		width: 35%;
	}

	.reactants-count, .element-symbol, .products-count {
		width: 10%;
	}

	#reactants-and-prodcuts {
		padding: 1em;
		margin: 0 auto;
		width: 100%;
	}

	.x, .w, .y {
		display: inline-block;
	}
</style>