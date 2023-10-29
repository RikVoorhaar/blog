<script lang="ts">
	export let src: string;
	export let alt: string | undefined;
</script>

<img {src} alt={alt} loading="lazy" class="bg-white rounded"/>
