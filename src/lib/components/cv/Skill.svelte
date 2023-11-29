<script lang="ts">
	export let data: {
		title: string;
		skills: string[];
		icons?: (string | undefined)[];
	};
	import { CheckCheck } from 'lucide-svelte';
</script>

<div class="mt-2">
    <span class="text-lg text-main-700 dark:text-main-500 font-bold">{data.title}</span>
    {#each data.skills as skill, i}
        <div class="flex items-center pl-4 pb-1">
            <span class="dark:text-green-500 text-green-600">
                {#if data.icons && data.icons[i]}
                    {@html data.icons[i]}
                {:else}
                    <CheckCheck />
                {/if}
            </span>
            <span class="pl-2 font-semibold">{skill}</span>
        </div>
    {/each}
</div>
