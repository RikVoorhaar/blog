<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	export let summary: string = '';
	export let id: string = '';
	export let hidden: boolean = true;

	onMount(() => {
		if (localStorage.getItem(`${id}-state`) !== undefined) {
			hidden = localStorage.getItem(`${id}-state`) === 'true';
		}
	});

	function swapState() {
		hidden = !hidden;
		localStorage.setItem(`${id}-state`, hidden.toString());
	}
</script>


<div class="my-4">
	<div on:click={swapState} class="flex align-top flex-auto">
		<span class={`inline-block transition-transform px-1 pl-0 ${hidden ? 'rotate-90' : ''}`}
			><ChevronRight /></span
		>
		{summary}
	</div>
	{#if !hidden}
		<div class="border-l-2 border-l-blue-700 pl-2 ml-2 my-0 py-0" transition:fly>
			<slot />
		</div>
	{/if}
</div>
