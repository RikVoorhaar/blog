<script lang="ts">
	export let data: {
		title: string;
		tools: string[];
	};
</script>

<div class="mt-2">
    <span class="text-lg text-main-700 dark:text-main-500 font-bold">{data.title}</span>
    <div class="flex items-center pl-4">
       <span class="dark:text-green-500 text-green-600"><slot/> </span>
        {#each data.tools as tool}
            <span class="pl-2 font-semibold">{tool}</span>
        {/each}
    </div>
</div>
