<script lang="ts">
	export let data: {
		date_start: string;
		date_end: string;
		position: string;
		employer: string;
		image: string;
	};
</script>

<div class="flex">
	<div class="w-36 mr-6 flex-shrink-0">
		<img src={data.image} alt={data.employer} class="w-full h-auto" />
	</div>
	<div class="flex-grow">
		<h3>
			{@html data.employer}<span class="text-black dark:text-white ml-4">{data.position}</span>
		</h3>
		<p class="italic">{data.date_start}&mdash;{data.date_end}</p>
		<slot />
	</div>
</div>
