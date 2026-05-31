<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import { onMount } from 'svelte';
	import type { Post } from '$lib/types';

	export let posts: Post[] = [];
	async function load() {
		const response = await fetch('/api/posts');
		const posts: Post[] = await response.json();
		return posts;
	}

	onMount(() => {
		if (posts.length) return;

		load().then((res) => {
			posts = res;
		});
	});
</script>

<div class="flex flex-auto grow gap-4 flex-wrap justify-center sm:p-8 xl:px-16">
	{#each posts as post (post.slug)}
		<PostCard {post} />
	{/each}
</div>
