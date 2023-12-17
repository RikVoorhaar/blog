<script lang="ts">
	import * as config from '$lib/config';
	import Darkmode from '$lib/components/darkmode.svelte';
	const link_class = `dark:font-semibold hover:text-blue-500 transition-colors`;
</script>

<div class="flex flex-row gap-4 px-4 py-6 bg-white dark:bg-black mb-16">
	<Darkmode />
	<a
		href="/"
		class="dark:font-extrabold font-semibold dark:text-main-500 hover:text-main-600 dark:hover:text-main-200 text-main-700 transition-colors"
	>
		{config.title}
	</a>

	<a class={link_class} href="/contact">Contact</a>
	<a class={link_class} href="/blog">Blog</a>
	<a class={link_class} href="/cv">CV</a>
</div>

<div
	class="bg-gradient-to-b  from-main-500 to-transparent -z-50 p-64 opacity-40 dark:opacity-100 absolute top-0 left-0 right-0 mix-blend-multiply transition-colors transition-opacity"
/>
