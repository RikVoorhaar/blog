<script lang="ts">
	import { formatDate } from '$lib/utils';
	export let data;
	import Output from '$lib/components/markdown/Output.svelte';
	import PostCardGallery from '$lib/components/PostCardGallery.svelte';
	import Container from '$lib/components/Container.svelte';
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<Container>
	<h1 class="m-1 mb-2">{data.meta.title}</h1>
	<p class="m-1 pb-12">
		Published on {formatDate(data.meta.date)}.
	</p>

	<div>
		<svelte:component this={data.content} />
	</div>
</Container>

<Container>
	<div class="prose-h2:mt-0">
		<h2>Other posts</h2>
	</div>
</Container>
<PostCardGallery />
