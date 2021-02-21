<script lang="ts">
	import { countElements, isBalanced, makeElement, makeMolecule, map } from "./ChemicalEquations";
	import type { Molecule } from "./ChemicalEquations"
	export let name: string;

	let h2Coefficient = 1
	let o2Coefficient = 1
	let h2oCoefficient = 1

	const h2: Molecule = makeElement('H', 2)
	const o2: Molecule = makeElement('O', 2)
	const h2o: Molecule = makeMolecule([makeElement('H', 2), makeElement('O')])

	let elementsOfH2: Map<string, number>
	$: elementsOfH2 = map(countElements(h2), v => v * h2Coefficient)

	let elementsOfO2: Map<string, number>
	$: elementsOfO2 = map(countElements(o2), v => v * o2Coefficient)

	let elementsOfH2O: Map<string, number>
	$: elementsOfH2O = map(countElements(h2o), v => v * h2oCoefficient)
</script>

<main>
	<input type="number" bind:value={h2Coefficient}>H_2 + <input type="number" bind:value={o2Coefficient}>O_2
	-->
	<input type="number" bind:value={h2oCoefficient}>H_2O

	<ul>
		{#each [...elementsOfH2.entries()] as [key, value]}
			<li>
				{key} --> {value}
			</li>
		{/each}
	</ul>

	<ul>
		{#each [...elementsOfO2.entries()] as [key, value]}
			<li>
				{key} --> {value}
			</li>
		{/each}
	</ul>

	<ul>
		{#each [...elementsOfH2O.entries()] as [key, value]}
			<li>
				{key} --> {value}
			</li>
		{/each}
	</ul>


	<button on:click={() => {
		console.log(map(countElements(h2), v => v * h2Coefficient))
		console.log(map(countElements(o2), v => v * o2Coefficient))
		console.log(map(countElements(h2o), v => v * h2oCoefficient))
	}}>Brett</button> 

	<p>
		Is balanced: {isBalanced({
			reactants: [[h2Coefficient, h2], [o2Coefficient, o2]],
			products:  [[h2oCoefficient, h2o]],
		  })}
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