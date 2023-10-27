<script lang="ts">
	import { formatDate } from '$lib/utils';

	export let data;
</script>

<div class="grid grid-cols-3 grid-flow-row gap-4">
	<!-- TODO: media breakpoints -->
	{#each data.posts as post}
		<div
			class="p-4 m-4 rounded bg-gradient-to-r  from-main-100 to-secondary-100 dark:to-secondary-800 dark:from-main-800"
		>
			<a href={post.slug} class="text-lg font-bold">{post.title}</a>
			<p>{formatDate(post.date)}</p>
			<p class="p-2">{post.description}</p>
		</div>
	{/each}
</div>
