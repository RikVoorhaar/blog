import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/posts' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		excerpt: z.string(),
		teaser: z.string(),
		categories: z.array(z.string()),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog };
