<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Footer from './footer.svelte';
	import Header from './header.svelte';
	import 'katex/dist/katex.min.css'
</script>

<div class="dark:text-white">
	<Header />



	<slot />

	<Footer />
</div>
