<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Footer from './footer.svelte';
	import Header from './header.svelte';
	import 'katex/dist/katex.min.css';
</script>

<div class="dark:text-white flex flex-col min-h-screen">
	<div class="flex-1 mb-20">
		<Header />
		<slot />
	</div>

	<Footer />
</div>
