import { defineMDSveXConfig as defineConfig, escapeSvelte } from 'mdsvex';
import remarkMath from 'remark-math';
import shiki from 'shiki';
import rehypeKatex from 'rehype-katex-svelte';
import addClasses from 'rehype-add-classes';
import toc from 'rehype-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await shiki.getHighlighter({ theme: 'monokai' });
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang }));
			return `{@html \`${html}\` }`;
		}
	},

	remarkPlugins: [remarkMath],
	rehypePlugins: [
		[rehypeKatex, { fleqn: true, throwOnError: false }],
		[addClasses, { pre: 'bg-white' }],
		// [rehypeSlug, {}],
		[rehypeAutolinkHeadings, {}],
		// [toc, {}]
	],
	layout: './src/mdsvex.svelte'
});

export default config;
