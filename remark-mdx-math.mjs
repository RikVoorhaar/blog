import { visit } from 'unist-util-visit';

const LB = '\x00LB\x00';
const RB = '\x00RB\x00';

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

				const mathValue = match[1].replaceAll(LB, '{').replaceAll(RB, '}');
				const isDisplay = match.index > 0 && value.charCodeAt(match.index - 1) === 10;

				if (isDisplay && /^\s*\n/.test(value.slice(match.index + match[0].length))) {
					newNodes.push({
						type: 'math',
						value: mathValue.trim(),
						data: { hName: 'div', hProperties: { className: ['math', 'math-display'] } }
					});
				} else if (match[1].includes('\n')) {
					newNodes.push({
						type: 'math',
						value: mathValue.trim(),
						data: { hName: 'div', hProperties: { className: ['math', 'math-display'] } }
					});
				} else {
					newNodes.push({
						type: 'inlineMath',
						value: mathValue.trim(),
						data: { hName: 'span', hProperties: { className: ['math', 'math-inline'] } }
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
