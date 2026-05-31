import { visit } from 'unist-util-visit';

const LB = '\x00LB\x00';
const RB = '\x00RB\x00';

/**
 * Remark plugin to restore { and } placeholders inside math nodes.
 * Used after remark-math to restore LaTeX grouping braces that were replaced
 * with placeholder tokens to prevent MDX from parsing them as JSX expressions.
 */
export default function remarkUnescapeMath() {
	return (tree) => {
		visit(tree, ['math', 'inlineMath'], (node) => {
			node.value = node.value.replaceAll(LB, '{').replaceAll(RB, '}');
		});
	};
}
