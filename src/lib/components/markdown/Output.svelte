<script lang="ts">
	export let indent: number = 0;
	let whitespaceIndent: string = ' '.repeat(indent);
</script>

<p class="m-0 font-semibold text-lg">Output</p>
<pre class="bg-inherit m-0 ml-2 p-0 pl-4 text-inherit border-l-4 rounded-l-none dark:border-l-sky-200 border-l-blue-700 rounded-none">
{whitespaceIndent}<slot />
</pre>
