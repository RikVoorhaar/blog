import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const postsDir = join(import.meta.dirname, 'src', 'posts');
const files = readdirSync(postsDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.unpublish'));

for (const filename of files) {
	const filepath = join(postsDir, filename);
	let content = readFileSync(filepath, 'utf-8');

	// Replace special characters inside math blocks with placeholder tokens,
	// otherwise MDX will parse them as JSX expressions (braces) or markdown
	// formatting (underscores interpreted as italics). The remark-mdx-math
	// plugin restores them during rendering.
	const escaped = content.replace(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g, (match) =>
		match.replace(/\{/g, 'LB').replace(/\}/g, 'RB').replace(/_/g, 'US').replace(/\*/g, 'ST')
	);

	if (escaped !== content) {
		writeFileSync(filepath, escaped);
		console.log(`Escaped: ${filename}`);
	} else {
		console.log(`No braces found: ${filename}`);
	}
}
console.log('\nDone!');
