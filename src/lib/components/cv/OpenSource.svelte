<script lang="ts">
	import { Github, ChevronRight } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	export let data: {
		title: string;
		url: string;
		info?: string;
	};
	let hidden = true;
</script>

<div class="mb-1">
	<Github class="inline text-green-600 dark:text-green-500" />
	<div class="pl-1 inline">
		<a class="text-lg text-main-700 dark:text-main-500 font-bold pr-2" href={data.url}> {data.title}</a
		>
	</div>
	{#if data.info}
		<div class="pl-4">
			<button
				on:click={() => {
					hidden = !hidden;
				}}
				class="flex align-top flex-auto italic font-semibold
         dark:hover:text-green-500 hover:text-green-600 transition-colors duration-500"
			>
				<span
					class={`inline-block transition-transform  px-1 pl-0 my-1 ${hidden ? 'rotate-90' : ''}`}
					><ChevronRight /></span
				>More info
			</button>
			{#if !hidden}
				<div
					class="border-l-2 border-l-main-700 dark:border-l-main-500 pl-2 ml-2 my-0 py-0"
					transition:fly
				>
					{@html data.info}
				</div>
			{/if}
		</div>
	{/if}
</div>
