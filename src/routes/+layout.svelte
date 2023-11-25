<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Footer from './footer.svelte';
	import Header from './header.svelte';
	import 'katex/dist/katex.min.css'
</script>

<div class="dark:text-white">
	<Header />

	<div class="bg-gradient-to-b from-white dark:from-black to-transparent -z-50 p-10">

	</div>

	<slot />

	<Footer />
</div>
