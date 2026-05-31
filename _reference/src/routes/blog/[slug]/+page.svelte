<script lang="ts">
	import { formatDate } from '$lib/utils';
	export let data;
	import PostCardGallery from '$lib/components/PostCardGallery.svelte';
	import Container from '$lib/components/Container.svelte';
	import SmallContainer from '$lib/components/SmallContainer.svelte';
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

<SmallContainer>
	<h1 class="font-extrabold text-2xl dark:text-main-500 text-main-600 text-center">Other posts you may like</h1>
</SmallContainer>
<PostCardGallery />
