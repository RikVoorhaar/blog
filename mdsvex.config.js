import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex-svelte';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	// smartypants: {
	// 	dashes: 'oldschool'
	// },

	remarkPlugins: [remarkMath],
	rehypePlugins: [[rehypeKatex, { fleqn: true, throwOnError: false }]],
	// layout: {
	// 	_: './src/lib/mdsvex.svelte'
	// }
});

export default config;
