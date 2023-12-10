<script lang="ts">
    import Date from "./Date.svelte";
	export let data: {
		date_start: string;
		date_end: string;
		position: string;
		employer: string;
		image: string;
	};
</script>

<div class="flex flex-col md:flex-row">
	<div class="w-24 mr-0 md:mr-6 flex-shrink-0 pb-0">
		<img src={data.image} alt={data.employer} class="w-full mb-0 h-auto" />
	</div>
	<div class="flex-grow prose-h3:mt-0">
		<h3>
			{@html data.employer}<span class="text-black dark:text-white ml-4">{data.position}</span>
		</h3>
            <Date>{data.date_start}&mdash;{data.date_end}</Date>
		<slot />
	</div>
</div>
