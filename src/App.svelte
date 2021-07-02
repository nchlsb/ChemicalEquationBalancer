<script lang="ts">
	import type { Counts, element, Equation } from "./ChemicalEquations"; 
	import { build, randomEquation, toTex, countElements, isBalanced } from "./ChemicalEquations";
	import { count, difference, intersection, isEmpty, Multiset, sumAll, toStringMultiset } from "./Multiset"
	import Katex from "./Katex.svelte"
	import type { ChemicalElement } from "./ChemicalElements";	
	import { range, toStringMap } from "./helpers";

	let equation = randomEquation()

	function replaceAtIndex<T>(array: T[], index: number, value: T): T[] {
		let retVal = new Array<T>();
		
		for (let i = 0; i < array.length; i++){
			retVal[i] = (i === index) ? value : array[i]
		}

		return retVal
	}

	let map: Map<ChemicalElement, Counts>
	$: map = build(equation)

	const size = 50

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

	const BAR_HEIGHT = 20
</script>

<main>
	<table id="reactants-and-prodcuts">
		<!-- written products and recants -->
		<tr>
			<!-- recants expression -->
			<td class="alignRight">
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
			<!-- arrow -->
			<td class="alignCenter" colspan="3">
				<Katex math={"\\rightarrow"} />
			</td>
			<!-- prodcuts expression -->
			<td>
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
		<!-- visualization -->
		{#each orderedEntries as [element, counts]}
		<tr>
			<!-- recants bar -->
			<td class="alignRight">
				<svg
					class="brett"
					transform="scale(-1, 1)"
					height={BAR_HEIGHT}
					width={Math.max(counts.amountInProducts, counts.amountInReactants) * 20}
				>
					<rect class="owed-bar" x=0 y=0 height={BAR_HEIGHT} width={counts.amountInProducts * 20}></rect>
					<rect class="has-bar" x=0 y=0 height={BAR_HEIGHT} width={counts.amountInReactants * 20}></rect>
				</svg>
			</td>
			<!-- recants count -->
			<td class="alignRight">
				<Katex math={counts.amountInReactants.toString()} displayMode={false}></Katex>
			</td>
			<!-- element symbol -->
			<td class="alignCenter">
				<Katex math={`\\mathrm{${element}}`} displayMode={false}></Katex>
			</td>
			<!-- products count -->
			<td>
				<Katex math={counts.amountInProducts.toString()} displayMode={false}></Katex>
			</td>
			<!-- products bar -->
			<td>
				<svg
					class="brett"
					height={BAR_HEIGHT}
					width={Math.max(counts.amountInProducts, counts.amountInReactants) * 20}
				>
					<rect class="owed-bar" x=0 y=0 height={BAR_HEIGHT} width={counts.amountInReactants * 20}></rect>
					<rect class="has-bar" x=0 y=0 height={BAR_HEIGHT} width={counts.amountInProducts * 20}></rect>
				</svg>
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

	td {
		text-align: left;
	}

	.alignRight {
		text-align: right;
	}

	.alignCenter {
		text-align: center;
	}

	#reactants-and-prodcuts{
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		width: 100%;

	}
</style>