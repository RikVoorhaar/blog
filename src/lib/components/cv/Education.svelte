<script lang="ts">
	type title_uni_pair = {
		title: string;
		university: string;
		note?: string;
	};
	export let data: {
		date_start: string;
		date_end: string;
		entry: title_uni_pair[];
	};
</script>

<p>
	<span class="italic">{data.date_start}&mdash;{data.date_end}</span><br />
	{#each data.entry as entry,i}
        {#if i>0}<br/>{/if}
		<span class="text-lg text-main-700 dark:text-main-500 font-bold pr-2 pl-4">{entry.title}</span> |
		<span class="font-semibold pl-2 font">{entry.university}</span>
        {#if entry.note}<span class="italic">({entry.note})</span>{/if}
	{/each}
</p>
