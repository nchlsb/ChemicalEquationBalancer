<script lang="ts">
	import type { Equation } from "./ChemicalEquations"; 
	import { atomsPerElementOnEquationSide, randomEquation, toTex, isBalanced } from "./ChemicalEquations";
	import Katex from "./Katex.svelte"
	import { sortBy } from 'ramda'
	import type { ChemicalElement } from "./ChemicalElements";	
	import { replaceAtIndex } from "./helpers";

	type Context = "Balancer" | "About"
	let context: Context
	$: context = "Balancer"

	let equation = randomEquation()

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

	type ElementView = {
		chemicalElement: ChemicalElement,
		
		atomsInReactants: number,
		atomsInProducts: number,

		reactantsPercent: number,
		elementNamePercent: number,
		productsPercent: number
	}

	let elementViews: ElementView[]
	$: elementViews =  sortBy(([x, _]) => /* TODO: atomicNumber(x) */ x, [...atomsPerElementOnEquationSide(equation).entries()])
	.map(([element, [atomsInReactants, atomsInProducts]]) => {
		const totalAtoms = atomsInReactants + atomsInProducts
		const w = 5 // percent
		return {
			chemicalElement: element,

			atomsInReactants,
			atomsInProducts,

			reactantsPercent: (100 - w) * atomsInReactants / totalAtoms,
			elementNamePercent: w,
			productsPercent: (100 - w) * atomsInProducts / totalAtoms
		}
	})

	const INCREASE = "▲";
	const DECREASE = "▼";
</script>

<main>
	<p>
		<button class={context === 'Balancer' ? 'highlighted' : ''}  on:click={_ => context = 'Balancer'}>Balancer</button>
		| <button class={context === 'About' ? 'highlighted' : ''}  on:click={_ => context = 'About'}>About</button>
	</p>
	{#if context === 'Balancer'}
		<p>
			{(isBalanced(equation)) ? '✅ Equation is balanced' : '❌ Equation not balanced'}
		</p>
0		
		<table id="equation-balance">
			{#each elementViews as {chemicalElement, atomsInReactants, atomsInProducts, reactantsPercent, elementNamePercent, productsPercent}}
			<tr>
				<td class="reactants-count">
					<Katex math={atomsInReactants.toString()} displayMode={false}></Katex>
				</td>
				<td class="element-symbol">
					<div><div class="x" style="width: {productsPercent}%"></div><div class="w" style="width: {elementNamePercent}%"><Katex math={`\\mathrm{${chemicalElement}}`} displayMode={false}></Katex></div><div class="y" style="width: {reactantsPercent}%"></div></div>
				</td>
				<td class="products-count">
					<Katex math={atomsInProducts.toString()} displayMode={false}></Katex>
				</td>
			</tr>
			{/each}
		</table>

		<table id="reactants-and-prodcuts">
			<tr id="increment-bar">
				{#each equation.reactants as [coefficient, _], index}		
					<td>
						<button class="increment" on:click={_ => {equation = withReactantCoefficientAtIndex(index, coefficient + 1)}}>{INCREASE}</button>
					</td>
					{#if index !== equation.reactants.length - 1}
						<td />
					{/if}
				{/each}
				<td></td>
				{#each equation.products as [coefficient, _], index}		
					<td>
						<button class="increment" on:click={_ => {equation = withProductCoefficientAtIndex(index, coefficient + 1)}}>{INCREASE}</button>
					</td>
					{#if index !== equation.products.length - 1}
						<td />
					{/if}
				{/each}
			</tr>
			<tr id="expressions">
				{#each equation.reactants as [coefficient, molecule], index}		
					<td>
						<Katex math={toTex(molecule, coefficient)} />
					</td>
					{#if index !== equation.reactants.length - 1}
						<td>
							<Katex math="+" />
						</td>
					{/if}
				{/each}
				<td id="arrow">
					<Katex math={"\\rightarrow"} />
				</td>
				{#each equation.products as [coefficient, molecule], index}		
					<td>
						<Katex math={toTex(molecule, coefficient)} />
					</td>
					{#if index !== equation.products.length - 1}
						<td>
							<Katex math="+" />
						</td>
					{/if}
				{/each}	
			</tr>
			<tr id="decrement-bar">
				{#each equation.reactants as [coefficient, _], index}		
					<td>
						<button class="decrement" disabled={coefficient === 1} on:click={_ => {equation = withReactantCoefficientAtIndex(index, coefficient - 1)}}>{DECREASE}</button>
					</td>
					{#if index !== equation.reactants.length - 1}
						<td />
					{/if}
				{/each}
				<td></td>
				{#each equation.products as [coefficient, _], index}		
					<td>
						<button class="decrement" disabled={coefficient === 1} on:click={_ => {equation = withProductCoefficientAtIndex(index, coefficient - 1)}}>{DECREASE}</button>
					</td>
					{#if index !== equation.products.length - 1}
						<td />
					{/if}
				{/each}
			</tr>
		</table>
	{:else}
		<h1>Chemical Equation Balancing App</h1>
		<h2>Todo - write a blurb</h2>
			<p>Todo - write a subblurb if needed</p>
		<h2>Credits</h2>
			<h3>Devlopers: 
				<a href="https://github.com/schreiberbrett">Brett Schreiber</a> and
				<a href="https://github.com/nchlsb">Nick Brady</a> 
			</h3>
			<h3>Chemistery Tutors Conulsted: </h3>
			<h3>UI/UX Consultant: </h3>
			<h3> Introduced the Devs to Eachother: Cal Doughan</h3>
			<!-- <h3>
				Insperations:
				<a href="https://www.desmos.com/calculator">Desmos</a> and
				<a href="https://www.youtube.com/watch?v=WUvTyaaNkzM"> 3Blue1Brown</a> 
			</h3> -->
		<h2>Source Code</h2>
			<a href="https://github.com/nchlsb/ChemicalEquationBalancer">Link to GitHub</a>
	{/if}
	
	
</main>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
<style>
	main {
		text-align: center;
	}
	
	.increment, .decrement {
		width: 100%;
	}

	.reactants-count {
		text-align: right;
	}

	#arrow, .element-symbol {
		text-align: center;
	}

	.products-count {
		text-align: left;
	}

	.reactants-count,.products-count {
		max-width: 100%;
		white-space: nowrap;
	}

	.element-symbol {
		width: 100%;
	}

	#reactants-and-prodcuts {
		margin: 0 auto;
	}

	#equation-balance {
		margin: 0 10vw;
	}

	.x, .w, .y {
		display: inline-block;
	}

	.highlighted {
		background-color: limegreen;
	}

	td {
		padding: 0px 5px;
	}

	#equation-balance td {
		padding: 15px 5px;
	}
</style>