<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	export let data;
</script>

<div class="flex flex-auto grow gap-4 flex-wrap justify-center sm:p-8 xl:px-16">
<!-- grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 "> -->
	{#each data.posts as post}
		<PostCard post={post} />
	{/each}
</div>
