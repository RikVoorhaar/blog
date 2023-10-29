<script lang="ts">
	export let src: string;
	export let alt: string | undefined;
</script>

<div class="w-full flex justify-center">
	<img {src} {alt} loading="lazy" class="rounded-lg block mx-auto m-0 dark:bg-white p-1" />
</div>
