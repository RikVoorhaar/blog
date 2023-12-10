import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import fs from 'fs';
import path from 'path';

export const load: PageServerLoad = async ({ params }) => {
	const redirects = JSON.parse(fs.readFileSync(path.resolve('src/lib/redirects.json'), 'utf8'));

	const targetPath = redirects[params.slug];
	if (targetPath) {
		throw redirect(301, targetPath);
	}
	throw error(
		404,
		`I'm sorry. I couldn't find page with the name <span class="font-semibold px-1">${params.slug}</span>`
	);
};
