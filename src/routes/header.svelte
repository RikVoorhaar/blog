<script lang="ts">
	import * as config from '$lib/config'
  import Darkmode from '$lib/components/darkmode.svelte';
</script>

<div class="flex flex-row gap-4 mx-4 my-2">
  <!-- Title -->
  <Darkmode/>
	<a href="/" class="title">
		<b>{config.title}</b>
	</a>

    <a href="/about">About me</a>
    <a href="/blog">Blog</a>
    <a href="/cv">CV</a>

</div>
