<script lang="ts">
	export let indent: number = 0;
	let whitespaceIndent: string = ' '.repeat(indent);
</script>

<p class="m-2 not-prose font-semibold text-lg">Output</p>
<div
	class="bg-inherit not-prose border-l-4 ml-4 mb-4 leading-5 dark:border-l-sky-200 border-l-blue-700"
>
	<pre class="bg-inherit m-0 ml-2 p-0 pl-4 text-inherit overflow-x-auto">
{whitespaceIndent}<slot />
</pre>
</div>
