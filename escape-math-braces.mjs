import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const postsDir = join(import.meta.dirname, 'src', 'posts');
const files = readdirSync(postsDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.unpublish'));

for (const filename of files) {
	const filepath = join(postsDir, filename);
	let content = readFileSync(filepath, 'utf-8');

	// Replace { and } inside $$...$$ display math blocks and $...$ inline math
	// with placeholder tokens, so MDX doesn't parse them as JSX expressions.
	// The remark-unescape-math plugin will restore them during rendering.
	const escaped = content.replace(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g, (match) =>
		match.replace(/\{/g, '\x00LB\x00').replace(/\}/g, '\x00RB\x00')
	);

	if (escaped !== content) {
		writeFileSync(filepath, escaped);
		console.log(`Escaped: ${filename}`);
	} else {
		console.log(`No braces found: ${filename}`);
	}
}
console.log('\nDone!');
