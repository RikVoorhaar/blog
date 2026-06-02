import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

	return rss({
		title: 'Rik Voorhaar — Blog',
		description: 'Articles about data science, mathematics, and programming',
		site: context.site,
		items: sorted.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.excerpt,
			link: `/blog/${post.id}/`
		})),
		customData: `<language>en</language>`
	});
}
