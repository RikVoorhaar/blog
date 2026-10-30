import type { SceneConfig, ViewerPreset } from './types';

/**
 * Defaults shared by every solid. Individual presets override only what they need.
 *
 * The look being aimed at is a photograph of an orange PLA print on a wooden tabletop:
 * a single window-like key light from the upper right, one long structured cast shadow
 * falling to the lower left, and just enough fill to keep the shaded orange readable.
 */
export const baseScene: SceneConfig = {
	orientation: [0, 0, 0],
	scale: 1,

	material: {
		// Saturated orange PLA. PLA is a dielectric: metalness stays at zero.
		color: '#ff8417',
		metalness: 0,
		// Matte-ish plastic: a broad, restrained highlight rather than a mirror.
		roughness: 0.62,
		glow: 0.2
	},

	camera: {
		// Long lens: flattens perspective so the frame reads as a product photo.
		fov: 28,
		elevation: 36,
		azimuth: 34,
		// Pulled back enough that the object occupies roughly a third of the width.
		distance: 7.6,
		// Push the look-at into the shadow so the object sits opposite it, leaving room.
		targetShift: 0.95
	},

	light: {
		// From screen-right and behind the object, like a window behind the table.
		azimuth: 145,
		elevation: 28,
		intensity: 3.4,
		color: '#fff7ee'
	},

	backdrop: {
		// Wood: the surface pattern does real work under a raking light.
		mode: 'wood',
		// Plain-surface colour (only used when mode is 'plain').
		color: '#8f8880',
		// Multiplies the wood colour map in wood mode.
		tint: '#d9d2c9',
		// One tile per 6.8 object radii — a big, quiet plank rather than fine stripes.
		tileRadii: 6.8,
		grainRotation: 124,
		// The scan's relief is subtle; this pushes it far enough to catch the light.
		normalScale: 0.9
	},

	// The object is lit evenly by the room; it never shadow-maps itself.
	selfShadow: false,

	// Uniform ambient is the big lift here: it opens up the shaded side of the lattice without
	// touching the table's cast shadow, which is what sells the contact with the surface.
	fill: 0.5,
	exposure: 1.1,
	shadowMapSize: 2048,
	// Tight ortho frustum: narrow rods need texel density more than they need reach.
	shadowSpan: 3.6
};

/**
 * Hand-tuned presets, one per Platonic solid in the printed set.
 *
 * They differ only where the mesh's proportions demand it: the tetrahedron is wide and
 * squat, the icosahedron is tall and narrow, and their shadows need different room.
 */
export const presets: Record<string, ViewerPreset> = {
	cube: {
		label: 'Cube',
		camera: { ...baseScene.camera, distance: 7.2, elevation: 36, azimuth: 34, targetShift: 0.95 },
		shadowSpan: 3.4
	},

	tetrahedron: {
		label: 'Tetrahedron',
		camera: { ...baseScene.camera, distance: 7.0, elevation: 33, azimuth: 28, targetShift: 0.7 },
		// Wide and squat: a steeper key keeps its long shadow inside the frame.
		light: { ...baseScene.light, elevation: 34 },
		shadowSpan: 3.9
	},

	octahedron: {
		label: 'Octahedron',
		camera: { ...baseScene.camera, distance: 7.2, elevation: 34, azimuth: 32, targetShift: 0.85 },
		shadowSpan: 3.4
	},

	icosahedron: {
		label: 'Icosahedron',
		camera: { ...baseScene.camera, distance: 7.8, elevation: 32, azimuth: 40, targetShift: 0.6 },
		light: { ...baseScene.light, elevation: 28 },
		shadowSpan: 3.5
	},

	dodecahedron: {
		label: 'Dodecahedron',
		camera: { ...baseScene.camera, distance: 8.0, elevation: 34, azimuth: 30, targetShift: 0.65 },
		light: { ...baseScene.light, elevation: 34 },
		shadowSpan: 3.8
	}
};

/** Merge a preset (by key) over the shared defaults. */
export function resolveScene(preset: string | ViewerPreset | undefined): SceneConfig {
	const extra: ViewerPreset = typeof preset === 'string' ? presets[preset] ?? {} : preset ?? {};
	return {
		...baseScene,
		...extra,
		material: { ...baseScene.material, ...extra.material },
		camera: { ...baseScene.camera, ...extra.camera },
		light: { ...baseScene.light, ...extra.light },
		backdrop: { ...baseScene.backdrop, ...extra.backdrop }
	};
}
