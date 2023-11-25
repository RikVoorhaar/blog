<script lang="ts">
	import type { Post } from '$lib/types';
	import { formatDate } from '$lib/utils';
	// import Image from 'svimg/Image.svelte'

	export let post: Post;
	let teaser_url: string = `/blog/teasers/original/${post.teaser}`;
</script>

<div
	class="p-4 m-0 relative group w-[320px] shadow-lg
"
>
	<div
		class="absolute inset-0 bg-gradient-to-r
	from-zinc-200 to-zinc-300
	opacity-[.85]
	dark:opacity-[.80]
	dark:from-zinc-900 dark:to-zinc-800
	group-hover:opacity-95
	transition-opacity duration-500
	rounded-xl"
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
		<a
			href={post.slug}
			class="text-xl font-extrabold leading-5
			 text-turbo-800 dark:text-turbo-500 hover:text-turbo-700
			 dark:hover:text-turbo-300 transition-colors tracking-wide">{post.title}</a
		>
		<p class="text-sm">{formatDate(post.date)}</p>
		<p class="px-2 my-1 border-l-2 border-l-turbo-800 dark:border-l-turbo-500 leading-5">
			{post.excerpt}
			<a
				href={post.slug}
				class="dark:text-main-300 dark:hover:text-main-100 text-main-700 hover:text-main-800 transition-colors"
				>read more ...</a
			>
		</p>
	</div>
</div>
