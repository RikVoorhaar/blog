import { visit } from 'unist-util-visit';

// Sentinel tokens for escaped characters inside math blocks.
// Must match escape-math-braces.mjs.
// Note: null bytes are stripped by MDX parser, so we use plain text.
const LB = 'LB'; // { (left brace — prevents MDX JSX expression parsing)
const RB = 'RB'; // } (right brace)
const US = 'US'; // _ (underscore — prevents markdown italic parsing)
const ST = 'ST'; // * (asterisk — prevents markdown emphasis parsing)

/**
 * Custom remark plugin that replaces remark-math for .mdx files.
 * Finds $$...$$ (display) and $$...$$ (inline) in text nodes and
 * converts them to math / inlineMath MDAST nodes.
 *
 * Also restores { } placeholder tokens inside math values.
 */
export default function remarkMdxMath() {
	return (tree) => {
		visit(tree, 'text', (node, index, parent) => {
			if (!parent || index === undefined) return;

			const value = node.value;
			const newNodes = [];
			let lastIndex = 0;

			const regex = /\$\$([\s\S]*?)\$\$/g;
			let match;

			while ((match = regex.exec(value)) !== null) {
				if (match.index > lastIndex) {
					newNodes.push({ type: 'text', value: value.slice(lastIndex, match.index) });
				}

				const mathValue = match[1]
					.replaceAll(LB, '{')
					.replaceAll(RB, '}')
					.replaceAll(US, '_')
					.replaceAll(ST, '*');
				const isDisplay = match.index > 0 && value.charCodeAt(match.index - 1) === 10;

				if (isDisplay && /^\s*\n/.test(value.slice(match.index + match[0].length))) {
					newNodes.push({
						type: 'math',
						value: mathValue.trim(),
						data: {
							hName: 'div',
							hProperties: { className: ['math', 'math-display'] },
							hChildren: [{ type: 'text', value: mathValue.trim() }]
						}
					});
				} else if (match[1].includes('\n')) {
					newNodes.push({
						type: 'math',
						value: mathValue.trim(),
						data: {
							hName: 'div',
							hProperties: { className: ['math', 'math-display'] },
							hChildren: [{ type: 'text', value: mathValue.trim() }]
						}
					});
				} else {
					newNodes.push({
						type: 'inlineMath',
						value: mathValue.trim(),
						data: {
							hName: 'span',
							hProperties: { className: ['math', 'math-inline'] },
							hChildren: [{ type: 'text', value: mathValue.trim() }]
						}
					});
				}

				lastIndex = match.index + match[0].length;
			}

			if (lastIndex < value.length) {
				newNodes.push({ type: 'text', value: value.slice(lastIndex) });
			}

			if (newNodes.length > 0) {
				parent.children.splice(index, 1, ...newNodes);
				return index + newNodes.length;
			}
		});
	};
}
