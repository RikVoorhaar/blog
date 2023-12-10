<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	export let summary: string;
	export let id: string;
	let hidden: boolean = true;

	onMount(() => {
		const storedState = localStorage.getItem(`${id}-state`);
		if (storedState !== null) {
			hidden = storedState === 'true';
		} else {
			hidden = true;
		}
		console.log(`hidden=${hidden} for id=${id}`);
	});
	function swapState() {
		hidden = !hidden;
		localStorage.setItem(`${id}-state`, hidden.toString());
	}
</script>

<div class="my-4">
	<button
		on:click={swapState}
		class="flex align-top flex-auto italic font-semibold
	 dark:hover:text-blue-400 hover:text-blue-800 transition-colors duration-500"
	>
		<span class={`inline-block transition-transform  px-1 pl-0 my-1 ${hidden ? 'rotate-90' : ''}`}
			><ChevronRight /></span
		>
		{summary}
	</button>
	{#if !hidden}
		<div class="border-l-2 border-l-blue-700 pl-2 ml-2 my-0 py-0" transition:fly>
			<slot />
		</div>
	{/if}
</div>
