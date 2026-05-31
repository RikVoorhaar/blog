<script lang="ts">
	export let src: string;
	export let alt: string | undefined;
</script>

<img {src} {alt} loading="lazy" class="rounded-md block ml-4 my-0 dark:bg-white p-0.5 max-w-32 md:float-right" />
