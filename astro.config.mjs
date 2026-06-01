import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMdxMath from './remark-mdx-math.mjs';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	site: 'https://rikvoorhaar.com',
	publicDir: 'static',

	// SvelteKit default: no trailing slash (ignore = both /path and /path/ work)
	// During SSG this generates /path/index.html for each route.
	trailingSlash: 'ignore',

	// Cloudflare Pages redirects mirrored for local preview.
	// Phase 8 will add public/_redirects for the CDN; these are Astro-native duplicates.
	redirects: {
		'/resume': '/cv',
		'/posts': '/blog',
		'/articles': '/blog'
	},

	integrations: [
		sitemap(),
		mdx({
			remarkPlugins: [remarkMdxMath],
			rehypePlugins: [
				[rehypeKatex, { fleqn: true, throwOnError: false }],
				rehypeSlug,
				rehypeAutolinkHeadings
			]
		})
	],

	markdown: {
		shikiConfig: {
			theme: 'monokai'
		}
	},

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@': '/src',
				$lib: '/src/lib'
			}
		}
	}
});
