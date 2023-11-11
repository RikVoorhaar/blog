<script lang="ts">
	import type { Post } from '$lib/types';
	import { formatDate } from '$lib/utils';

	export let post: Post;
    let teaser_url: string = `/blog/teasers/${post.slug}.webp`
</script>

<div
	class="p-4 m-0 rounded bg-gradient-to-r from-main-100 to-secondary-100 dark:to-secondary-800 dark:from-main-800"
>
	<a href={post.slug} class="text-lg font-bold">{post.title}</a>
	<p class="text-sm">{formatDate(post.date)}</p>
    <img src={teaser_url} alt="teaser" class="rounded-lg"/>
	<p class="p-2">{post.excerpt}</p>
</div>
