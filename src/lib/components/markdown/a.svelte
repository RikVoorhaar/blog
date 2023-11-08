<script lang="ts">
	export let href: string;
</script>

<a {href} class="text-blue-700 hover:text-blue-800 transition-colors duration-300 dark:text-blue-300 font-semibold hover:dark:text-blue-200 no-underline"><slot /></a>
