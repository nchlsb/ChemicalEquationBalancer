<script>
	import katex from "katex";
	export let math;
	export let displayMode = false;

    //const options = {output: 'html', displayMode: false}
	
	// const options = {
	// 	displayMode: displayMode,
	// 	throwOnError: false
	// }

	const options = {
		output: 'html',
		displayMode: displayMode,
	}
	
	$: katexString = katex.renderToString(math, options);
</script>

<!-- <svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
</svelte:head> -->

<!--https://svelte.dev/repl/49ff6c089825418888cf804d9dde77bc?version=3.35.0-->

{@html katexString}