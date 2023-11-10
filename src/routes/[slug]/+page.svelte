<script lang="ts">
	import { formatDate } from '$lib/utils';
	export let data;
	import Output from '$lib/components/markdown/Output.svelte';
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<div class="grid grid-cols-1 place-items-center w-full">
	<div
		class="max-w-4xl w-full
  dark:text-white
    
    prose dark:prose-invert lg:prose-lg prose-zinc prose-p:mb-4 prose-p:mt-0 prose-p:leading-normal prose-li:my-0 prose-li:leading-normal prose-ul:py-0
    min-w-0 p-4 m-4  rounded bg-gradient-to-r from-main-100 to-secondary-100
  dark:to-secondary-800 dark:from-main-800
    tansition-colors duration-300"
	>
		<h1>{data.meta.title}</h1>
		<p>
			Published on {formatDate(data.meta.date)}.
		</p>

		<div>
			<svelte:component this={data.content} />
		</div>
	</div>
</div>
