<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	export let data;
</script>

<div class="grid grid-cols-1 grid-flow-row gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	<!-- TODO: media breakpoints -->
	{#each data.posts as post}
		<PostCard post={post} />
	{/each}
</div>
