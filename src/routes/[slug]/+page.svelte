<script lang="ts">
    import { formatDate } from "$lib/utils";
    export let data
    import Output from "$lib/components/markdown/Output.svelte";
</script>

<svelte:head>
    <title>{data.meta.title}</title>
    <meta property="og:type" content="article"/>
    <meta property="og:title" content={data.meta.title}/>
</svelte:head>

<div class="grid grid-cols-1 place-items-center w-full">
<div class="prose max-w-4xl dark:text-white  w-full min-w-0 p-4 m-4 dark:prose-invert lg:prose-lg rounded bg-gradient-to-r  from-main-100 to-secondary-100 dark:to-secondary-800 dark:from-main-800 tansition-colors duration-300">
    <h1>{data.meta.title}</h1>
    <p>
        Published on {formatDate(data.meta.date)}.
    </p>

    <div>
        <svelte:component this={data.content}/>
    </div>
</div>
</div>