import { defineMDSveXConfig as defineConfig, escapeSvelte } from 'mdsvex';
import remarkMath from 'remark-math';
import shiki from 'shiki';
import rehypeKatex from 'rehype-katex-svelte';

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
	rehypePlugins: [[rehypeKatex, { fleqn: true, throwOnError: false }]],
	layout: './src/mdsvex.svelte'
});

export default config;
