<script lang="ts">
	import type { Post } from '$lib/types';
	import { formatDate } from '$lib/utils';
	// import Image from 'svimg/Image.svelte'

	export let post: Post;
	let teaser_url: string = `/blog/teasers/original/${post.teaser}`;
</script>

<div class="p-4 m-0 rounded relative group">
	<div class="absolute inset-0 bg-gradient-to-r from-main-100 to-secondary-100 dark:from-blue-800 dark:to-blue-900" />
	<div
		class="absolute inset-0 bg-gradient-to-r from-main-300 to-secondary-300 
		dark:from-blue-900 dark:to-blue-950
		opacity-0 group-hover:opacity-100 transition-opacity duration-500"
	/>
	<div class="relative z-10">
		<div class="content-center py-2 pb-4">
			<img
				src={teaser_url}
				alt="teaser"
				class="m-auto rounded-lg bg-white max-h-52 object-contain"
			/>
		</div>
		<a href={post.slug} class="text-lg font-bold hover:text-blue-500 transition-colors"
			>{post.title}</a
		>
		<p class="text-sm">{formatDate(post.date)}</p>
		<p class="px-2 my-1 border-l-2 border-l-black dark:border-l-white">
			{post.excerpt}
			<a
				href={post.slug}
				class="dark:text-blue-300 dark:hover:text-blue-100 text-blue-600 hover:text-blue-800"
				>read more ...</a
			>
		</p>
	</div>
</div>
