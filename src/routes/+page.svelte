<script lang="ts">
	import SmallContainer from '$lib/components/SmallContainer.svelte';
	import SectionHeader from '$lib/components/cv/SectionHeader.svelte';

	const a_class: string =
		'font-semibold hover:text-blue-500 transition-colors text-blue-700 dark:text-blue-300 dark:hover:text-blue-400';
</script>

<SmallContainer>
	<h1 class="font-extrabold text-3xl dark:text-main-500 text-main-600 mb-4">Hello</h1>
	<p>
		I'm <span class="font-semibold">Rik Voorhaar</span>, a father and software developer currently
		living in Copenhagen. This is my personal page and blog, I hope you like it.
	</p>

	<SectionHeader>About this website</SectionHeader>
	<p>
		I made this website from scratch using <a class={a_class} href="https://svelte.dev/">Svelte</a>
		and
		<a class={a_class} href="https://tailwindcss.com/">Tailwind</a>. The blog posts are written in
		markdown and rendered using
		<a class={a_class} href="https://github.com/pngwn/MDsveX">MDsveX</a>. This website is
		self-hosted on my VPS using Node inside a Docker container. You can find
		<a class={a_class} href="https://github.com/RikVoorhaar/blog"
			>the source code for this website here</a
		>.
	</p>
</SmallContainer>
