<script lang="ts">
	export let type: string;
	export let content: string;
	export let href: string | undefined = undefined;
</script>

<p class="mb-1">
	<span class=" dark:text-green-500 text-green-600 mr-1"><slot /></span>
	<span class="dark:text-main-500 text-main-700 font-semibold">{type}</span>:
	{#if href}
		<a href={href} class="hover:text-blue-500 hover:dark:text-blue-500 dark:text-blue-300 text-blue-700 transition-colors">{content}</a>
	{:else}
		{content}
	{/if}
</p>
