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
		roughness: 0.62
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
		intensity: 5.4,
		color: '#fff7ee'
	},

	wood: {
		// Trims the scan toward the darker, quieter walnut of the reference photo.
		tint: '#bfad9b',
		// One tile per ~1.7 object radii, so grain reads at tabletop scale.
		tileRadii: 1.7,
		grainRotation: 124,
		roughness: 1
	},

	// Sky/bounce fill: enough to keep shaded orange readable, not enough to flatten contrast.
	fill: 1.6,
	exposure: 1.2,
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
		wood: { ...baseScene.wood, ...extra.wood }
	};
}
