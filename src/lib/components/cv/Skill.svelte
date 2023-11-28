<script lang="ts">
	import { getIcon } from '$lib/components/cv/cvIcons';
	export let data: {
		title: string;
		skills: string[];
		icons: (string | undefined)[];
	};
</script>

<span class="text-lg text-main-700 dark:text-main-500 font-bold">{data.title}</span>
{#each data.skills as skill, i}
	<div class="flex items-center pl-4">
		{#if data.icons[i]}
			<div class="w-6 h-6">
				{@html getIcon(data.icons[i])}
			</div>
		{/if}
		<span class="pl-2 font-semibold">{skill}</span>
	</div>
{/each}
