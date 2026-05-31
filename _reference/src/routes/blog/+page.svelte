<script lang="ts">
	import PostCardGallery from '$lib/components/PostCardGallery.svelte';
	import type { Post } from '$lib/types';
	export let data: { posts: Post[] };
</script>

<PostCardGallery posts={data.posts} />
