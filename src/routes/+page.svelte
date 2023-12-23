<script lang="ts">
	import SmallContainer from '$lib/components/SmallContainer.svelte';
	import SectionHeader from '$lib/components/cv/SectionHeader.svelte';
	import LandingSection from '$lib/components/landing/landingSection.svelte';
	import { BookA, CookingPot, Music, Code, Gamepad2 } from 'lucide-svelte';

	const a_class: string =
		'font-semibold hover:text-blue-500 transition-colors text-blue-700 dark:text-blue-300 dark:hover:text-blue-400';
	const icon_size: number = 16;
	const stroke_width: number = 3;
</script>

<SmallContainer>
	<h1 class="font-extrabold text-3xl dark:text-main-500 text-main-600 mb-4">Hello</h1>
	<p>
		I'm <span class="font-semibold">Rik Voorhaar</span>, a father and software developer currently
		living in Copenhagen. This is my personal page and blog, I hope you like it.
	</p>

	<SectionHeader>About me</SectionHeader>
	<p class="mb-2">
		Check out <a class={a_class} href="/cv"> my CV / resume </a> page if you want to know what I do
		for a living. <br />
		On a personal level here are some of my hobbies:
	</p>
	<p class="mb-2">
		<LandingSection title="Reading"
			><BookA class="inline" size={icon_size} strokeWidth={stroke_width} /></LandingSection
		>
		I read almost everyday. Mostly sci-fi and fantasy novels, but also many other books. You can find
		an up-to-date list of all the books I've been reading on
		<a class={a_class} href="https://www.goodreads.com/tilpo">Goodreads</a>.
	</p>
	<p class="mb-2">
		<LandingSection title="Cooking"
			><CookingPot class="inline" size={icon_size} strokeWidth={stroke_width} /></LandingSection
		>
		I'm an enthuisiastic home cook, and I'm never too tired to cook a nice meal. I don't really stick
		to any particular cuisine, and I love experimenting with new recipes.
	</p>
	<p class="mb-2">
		<LandingSection title="Music"
			><Music class="inline" size={icon_size} strokeWidth={stroke_width} /></LandingSection
		>
		I've had a passion for music for a long time. I am alway on the hunt for new albums, and I don't
		stick to any particular genre. I keep track of the albums I like on
		<a class={a_class} href="https://rateyourmusic.com/collection/Tilpo/oo">Rate Your Music</a>, and
		I have been logging all the music I've been listening to on
		<a class={a_class} href="https://www.last.fm/user/Tilpo">Last.fm</a> since 2010. I also play guitar
		(sometimes).
	</p>
	<p class="mb-2">
		<LandingSection title="Coding"
			><Code class="inline" size={icon_size} strokeWidth={stroke_width} /></LandingSection
		>
		I like to code in my free time, usually as part of a deep-dive in a topic I want to learn more about.
		If what I learned is interesting, I usually write a blog post about it.
	</p>
	<p class="mb-2">
		<LandingSection title="Gaming"
			><Gamepad2 class="inline" size={icon_size} strokeWidth={stroke_width} />
		</LandingSection>
		I have always enjoyed gaming in my free time, even though nowadays it's hard to find the time. My
		favorite genres are open-world RPGs, sandbox and survivalcraft games. I also enjoy replaying games
		from my youth, and I really enjoy staying up to date with the speedrunning community around games
		I like.
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
