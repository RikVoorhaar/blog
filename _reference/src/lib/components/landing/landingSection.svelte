<script lang="ts">
	export let title: string;
</script>

<span class="font-extrabold dark:font-semibold pr-1 dark:text-main-500 text-lime-700"
	><span class="pr-1">
		<slot />
	</span>{title}
</span>
