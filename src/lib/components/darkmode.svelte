<script lang="ts">
	import { browser } from '$app/environment';
	import {Moon, SunMedium} from 'lucide-svelte'

	let current_theme: string;

	function init_theme() {
		if (
			localStorage.theme === 'light' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)
		) {
			current_theme = 'light';
		} else {
			current_theme = 'dark';
		}
	}
	if (browser) {
		init_theme();
	}

	function set_theme(theme: string) {
		current_theme = theme;
		localStorage.theme = theme;
		document.documentElement.classList.add(theme);
		document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
	}

	function onClick() {
		const new_theme = current_theme === 'dark' ? 'light' : 'dark';
		set_theme(new_theme);
	}
</script>

<svelte:head>
	<script>
		let current_theme
		if (
			localStorage.theme === 'light' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)
		) {
			current_theme = 'light';
		} else {
			current_theme = 'dark';
		}
		localStorage.theme = current_theme;
		document.documentElement.classList.add(current_theme);
		document.documentElement.classList.remove(current_theme === 'dark' ? 'light' : 'dark');
	</script>
</svelte:head>

<button class="" on:click={onClick}>
	{#if (current_theme === 'light')}
		<SunMedium size=18/>
	{:else}
		<Moon size=18/>
	{/if}
</button>
