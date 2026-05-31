import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import remarkUnescapeMath from './remark-unescape-math.mjs';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	site: 'https://rikvoorhaar.com',

	integrations: [mdx()],

	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath, remarkUnescapeMath],
			rehypePlugins: [
				[rehypeKatex, { fleqn: true, throwOnError: false }],
				rehypeSlug,
				rehypeAutolinkHeadings
			]
		}),
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
