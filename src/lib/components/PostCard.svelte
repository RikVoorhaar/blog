<script lang="ts">
	import type { Post } from '$lib/types';
	import { formatDate } from '$lib/utils';
	// import Image from 'svimg/Image.svelte'

	export let post: Post;
	let teaser_url: string = `/blog/teasers/original/${post.teaser}`;
</script>

<div class="p-4 m-0 relative group w-[320px] shadow-lg">
	<div class="absolute inset-0 bg-gradient-to-r from-main-100 to-secondary-100 dark:from-main-900 dark:to-secondary-900 rounded-lg" />
	<div
		class="absolute inset-0 bg-gradient-to-r from-main-200 to-secondary-200 
		dark:from-secondary-800 dark:to-main-800
		opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
	/>
	<div class="relative z-10">
		<div class="content-center py-2 pb-4">
			<a href={post.slug}>
				<img
					src={teaser_url}
					alt="teaser"
					class="m-auto rounded-lg bg-white max-h-52 object-contain"
				/>
			</a>
		</div>
		<a href={post.slug} class="text-lg font-bold leading-5 text-main-600 dark:text-main-300 hover:text-main-800 dark:hover:text-main-100 transition-colors tracking-wide"
			>{post.title}</a
		>
		<p class="text-sm">{formatDate(post.date)}</p>
		<p class="px-2 my-1 border-l-2 border-l-main-800 dark:border-l-main-300 leading-5 font-light">
			{post.excerpt}
			<a
				href={post.slug}
				class="dark:text-main-300 dark:hover:text-main-100 text-main-600 hover:text-main-400 transition-colors"
				>read more ...</a
			>
		</p>
	</div>
</div>
