import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const post = await import(`../../../posts/${params.slug}.md`);

		return {
			content: post.default,
			meta: post.metadata
		};
	} catch (e) {
		throw error(404, `I'm sorry. I couldn't find the blog post with the name <span class="font-semibold px-1">${params.slug}</span>`);
	}
}
