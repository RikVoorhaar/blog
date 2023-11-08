<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { blur } from 'svelte/transition';
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

<p on:click={swapState} class="my-0 py-0">
	<span class={`inline-block transition-transform ${hidden ? 'rotate-90' : ''}`}
		><ChevronRight /></span
	>
	{summary}
</p>
{#if !hidden}
	<div class="border-l-2 border-l-blue-700 pl-2 my-0 py-0" transition:blur={{amount:10}}>
		<slot />
	</div>
{/if}
