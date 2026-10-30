/**
 * Viewer glue that deliberately does *not* import Three.js.
 *
 * It watches for viewer elements, waits until one is near the viewport, and only then
 * dynamically imports the rendering engine. That keeps the Three.js chunk and the scene
 * assets off every page that does not contain a viewer, and off the critical path for pages
 * that do.
 */

import type { ViewerHandle } from './engine';

interface Mounted {
	handle: ViewerHandle;
}

const mounted = new Map<HTMLElement, Mounted>();
let observer: IntersectionObserver | null = null;

function stageOf(root: HTMLElement) {
	return {
		canvas: root.querySelector<HTMLCanvasElement>('[data-canvas]'),
		reset: root.querySelector<HTMLButtonElement>('[data-reset]'),
		status: root.querySelector<HTMLElement>('[data-status]')
	};
}

function setState(root: HTMLElement, state: 'idle' | 'loading' | 'ready' | 'error', message = '') {
	root.dataset.state = state;
	const { status } = stageOf(root);
	if (!status) return;
	status.textContent = message;
	status.hidden = state === 'ready';
}

async function activate(root: HTMLElement) {
	if (mounted.has(root) || root.dataset.state === 'loading' || root.dataset.state === 'ready')
		return;

	const { canvas, reset } = stageOf(root);
	const src = root.dataset.src;
	const preset = root.dataset.preset;
	const textures = {
		color: root.dataset.textureColor,
		normal: root.dataset.textureNormal,
		roughness: root.dataset.textureRoughness
	};

	if (!canvas || !src || !textures.color || !textures.normal || !textures.roughness) {
		setState(root, 'error', 'Viewer is missing its mesh or textures.');
		return;
	}

	setState(root, 'loading', 'Loading…');

	try {
		const { mount } = await import('./engine');
		const handle = await mount({
			src,
			preset,
			canvas,
			textures: textures as { color: string; normal: string; roughness: string },
			onReady: () => setState(root, 'ready')
		});
		mounted.set(root, { handle });
		reset?.addEventListener('click', handle.reset);
	} catch (error) {
		console.error('[lattice-viewer]', error);
		setState(root, 'error', 'This browser could not start the 3D viewer.');
	}
}

function observeAll() {
	const roots = document.querySelectorAll<HTMLElement>('[data-lattice-viewer]');
	if (!roots.length) return;

	if (!('IntersectionObserver' in window)) {
		roots.forEach((root) => void activate(root));
		return;
	}

	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const root = entry.target as HTMLElement;
				observer?.unobserve(root);
				void activate(root);
			}
		},
		// Start work a little before the viewer scrolls into view.
		{ rootMargin: '300px 0px' }
	);

	roots.forEach((root) => {
		if (mounted.has(root)) return;
		observer?.observe(root);
	});
}

function disposeAll() {
	for (const [root, entry] of mounted) {
		entry.handle.dispose();
		const { reset } = stageOf(root);
		if (reset) reset.replaceWith(reset.cloneNode(true));
		mounted.delete(root);
	}
	observer?.disconnect();
	observer = null;
}

observeAll();
document.addEventListener('astro:page-load', observeAll);
// Full-page navigations: release GPU resources on the way out.
window.addEventListener('pagehide', disposeAll);
