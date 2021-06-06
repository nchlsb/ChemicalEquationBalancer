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
/*
	let reactants: Multiset<ChemicalElement>
	$: reactants = sumAll(equation.reactants.map(([coefficient, molecule]) => countElements(molecule, coefficient)))

	let products: Multiset<ChemicalElement>
	$: products = sumAll(equation.products.map(([coefficient, molecule]) => countElements(molecule, coefficient)))

	let inBoth: Multiset<ChemicalElement>
	$: inBoth = intersection(reactants, products)

	let owedInProducts: Multiset<ChemicalElement>
	$: owedInProducts = difference(reactants, products)
    
	let owedInReactants: Multiset<ChemicalElement>
	$: owedInReactants = difference(products, reactants)

	let equationIsBalanced: boolean
	$: equationIsBalanced = isEmpty(owedInReactants) && isEmpty(owedInProducts)
*/
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

</script>

<main>
	<section id="reactants">
		{#each equation.reactants as [coefficient, molecule], index}
			<!-- <button on:click={_ => equation = withReactantCoefficientAtIndex(index, coefficient + 1)}>
				{#each [...countElements(molecule).elements.entries()] as [chemicalElement, n]}
				<li>
					{#each range(n) as _}
						<svg width={size} height={size}>
							<circle cx={size / 2} cy={size / 2} r={size / 2.5} stroke="black" stroke-width="3" fill="white"></circle>
							<text x={size / 2} y={(size * 5) / 8} fill="black" text-anchor="middle">{chemicalElement}</text>
						</svg>
					{/each}
				</li>
				{/each}
			</button> -->

			{#if index !== 0}
				<Katex math="+" />
			{/if}
			<input type="number" min="1" bind:value={coefficient} on:input={event => {
				equation = withReactantCoefficientAtIndex(index, parseInt(event.currentTarget.value))
			}}>
			
			<Katex math={toTex(molecule)} />
		{/each}
	</section>
	<section id="arrow">
		<Katex math={"\\rightarrow"} />
	</section>
	<section id="products">
		{#each equation.products as [coefficient, molecule], index}
			<!-- <button on:click={_ => equation = withProductCoefficientAtIndex(index, coefficient + 1)}>
				{#each [...countElements(molecule).elements.entries()] as [chemicalElement, n]}
				<li>
					{#each range(n) as _}
						<svg width={size} height={size}>
							<circle cx={size / 2} cy={size / 2} r={size / 2.5} stroke="black" stroke-width="3" fill="white"></circle>
							<text x={size / 2} y={(size * 5) / 8} fill="black" text-anchor="middle">{chemicalElement}</text>
						</svg>
					{/each}
				</li>
				{/each}
			</button> -->

			{#if index !== 0}
				<Katex math="+" />
			{/if}
			<input type="number" min="1" bind:value={coefficient} on:input={event =>
				equation = withProductCoefficientAtIndex(index, parseInt(event.currentTarget.value))
			}> <Katex math={toTex(molecule)} />
		{/each}
	</section>

	<p>
		{toStringMap(map)}
	</p>

	<!--
	<ul id="owed-in-products"> Owed in products:
	{#each [...owedInProducts.elements.entries()] as [chemicalElement, n]}
		<li>
			{#each range(n) as _}
				<svg width={size} height={size}>
					<circle cx={size / 2} cy={size / 2} r={size / 2.5} stroke="black" stroke-dasharray="5,5" stroke-width="3" fill="white"></circle>
					<text x={size / 2} y={(size * 5) / 8} fill="black" text-anchor="middle">{chemicalElement}</text>
				</svg>
			{/each}
		</li>
	{/each}
	</ul>

	<ul id="owed-in-reactants"> Owed in reactants:
		{#each [...owedInReactants.elements.entries()] as [chemicalElement, n]}
			<li>
				{#each range(n) as _}
					<svg width={size} height={size}>
						<circle cx={size / 2} cy={size / 2} r={size / 2.5} stroke="black" stroke-dasharray="5,5" stroke-width="3" fill="white"></circle>
						<text x={size / 2} y={(size * 5) / 8} fill="black" text-anchor="middle">{chemicalElement}</text>
					</svg>
				{/each}
			</li>
		{/each}
	</ul>

	<ul id="in-both"> In both:
		{#each [...inBoth.elements.entries()] as [chemicalElement, n]}
			<li>
				{#each range(n) as _}
					<svg width={size} height={size}>
						<circle cx={size / 2} cy={size / 2} r={size / 2.5} stroke="black" stroke-width="3" fill="white"></circle>
						<text x={size / 2} y={(size * 5) / 8} fill="black" text-anchor="middle">{chemicalElement}</text>
					</svg>
				{/each}
			</li>
		{/each}
	</ul>
	-->

	<table>
		{#each [...map.entries()] as [element, count]}
			<tr>
				<td rowspan="2">{element}</td>
				<td>{count.amountInProducts}</td>
				<td>
					<svg
						height=10
						width={Math.max(count.amountInProducts, count.amountInReactants) * 20}
					>
						<rect class="products-bar" x=0 y=0 height=10 width={count.amountInProducts * 20}></rect>
					</svg>
				</td>
			</tr>
			<tr>
				<!-- td rowspan from the previous tr -->
				<td>{count.amountInReactants}</td>
				<td>
					<svg
						height=10
						width={Math.max(count.amountInProducts, count.amountInReactants) * 20}
					>
						<rect class="reactants-bar" x=0 y=0 height=10 width={count.amountInReactants * 20}></rect>
					</svg>
				</td>
			</tr>
		{/each}
	</table>

	<p id="is-balanced">
		Is balanced: {isBalanced(map)}
	</p>
</main>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	li {
		list-style: none;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	input[type="number"] {
		width: 50px;
	}

	.products-bar {
		fill: blue;
	}

	.reactants-bar {
		fill: red;
	}

	td {
		text-align: left;
	}
</style>