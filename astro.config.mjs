import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
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

	integrations: [
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
