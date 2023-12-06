<script lang="ts">
	import { FileCheck, GraduationCap, ChevronRight } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import Date from '$lib/components/cv/Date.svelte';

	export let data: {
		date: string;
		title: string;
		url: string;
		published?: string;
		info?: string;
		coauthors?: string[];
	};
	let hidden = true;
</script>

<Date>{data.date}</Date><br />
<p class="pl-4">
	<a class="text-lg text-main-700 dark:text-main-500 font-bold pr-2" href={data.url}>{data.title}</a
	>
	{#if data.published}
		<br /><span class="mb-0">
			<span class=""
				><FileCheck class="inline mr-1 dark:text-green-500 text-green-600" /> published in
				<span class="font-semibold">{data.published}</span></span
			>
		</span>
	{/if}
	{#if data.coauthors}
		<br /><span class="">
			<span class=""
				><GraduationCap class="inline mr-1 dark:text-green-500 text-green-600" /> joined work with
				{#each data.coauthors as coauthor, i}
					{#if i > 0} and {/if}
					<span class="font-semibold">{coauthor} </span>
				{/each}
			</span>
		</span>
	{/if}
	{#if data.info}
		<div class="">
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
</p>
