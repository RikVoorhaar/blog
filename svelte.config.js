import adapter from '@sveltejs/adapter-node';
// import { vitePreprocess } from '@sveltejs/kit/vite';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import image from 'svelte-image';

const imageConfig = {
	processFolders: ['blog/teasers/original'],
	sizes: [200, 400],
	webp: true
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [preprocess(), mdsvex(mdsvexConfig), image(imageConfig)],
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
