/**
 * Tiny shared asset cache.
 *
 * The test page stacks several viewers, and every one of them uses the same wood textures
 * (and, in principle, could share a mesh). Downloads must happen once, not once per canvas,
 * so fetches are memoised at module level. Each viewer still builds its own GPU resources —
 * a texture object belongs to one WebGL context — but the bytes and decoded images are shared.
 */

const buffers = new Map<string, Promise<ArrayBuffer>>();
const images = new Map<string, Promise<HTMLImageElement>>();

export function loadArrayBuffer(url: string): Promise<ArrayBuffer> {
	let pending = buffers.get(url);
	if (!pending) {
		pending = fetch(url).then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
			return res.arrayBuffer();
		});
		pending.catch(() => buffers.delete(url));
		buffers.set(url, pending);
	}
	return pending;
}

export function loadImage(url: string): Promise<HTMLImageElement> {
	let pending = images.get(url);
	if (!pending) {
		pending = new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.decoding = 'async';
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error(`Failed to load image ${url}`));
			img.src = url;
		});
		pending.catch(() => images.delete(url));
		images.set(url, pending);
	}
	return pending;
}
