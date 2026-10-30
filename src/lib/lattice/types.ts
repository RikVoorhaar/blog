/**
 * Scene parameters for the lattice viewer.
 *
 * These are *data*, not rendering logic: every number a screenshot iteration would change
 * lives here (or in `presets.ts`), and `engine.ts` only knows how to turn them into a
 * Three.js scene. Lengths are expressed as multiples of the model's bounding-sphere radius,
 * so a preset keeps working if a mesh is regenerated at a different size.
 */

export interface CameraConfig {
	/** Camera distance from the look-at point, in bounding-sphere radii. */
	distance: number;
	/** Degrees above the tabletop. 90 would be straight down. */
	elevation: number;
	/** Degrees around the vertical axis; 0 looks along −Z toward +Z. */
	azimuth: number;
	/** Vertical field of view in degrees. A long lens keeps the perspective flat. */
	fov: number;
	/**
	 * How far to push the look-at point along the cast-shadow direction, in bounding-sphere
	 * radii. This is what leaves empty tabletop beside the object for the shadow to land on.
	 */
	targetShift: number;
}

export interface LightConfig {
	/** Degrees around the vertical axis the light comes *from*. */
	azimuth: number;
	/** Degrees above the tabletop. Low angles stretch the cast shadow. */
	elevation: number;
	intensity: number;
	color: string;
}

export interface WoodConfig {
	/** Multiplies the wood colour map — use it to warm/cool and darken the plank. */
	tint: string;
	/** Width of one texture tile, in bounding-sphere radii. Sets how big the grain reads. */
	tileRadii: number;
	/** Degrees to rotate the grain in the plane. */
	grainRotation: number;
	/** Multiplies the roughness map. Higher is more matte. */
	roughness: number;
}

export interface MaterialConfig {
	/** Orange PLA base colour. */
	color: string;
	/** 0–1. Nonmetal plastic wants 0. */
	metalness: number;
	/** Base roughness; the printed-plastic sheen comes from this plus the key light. */
	roughness: number;
}

export interface SceneConfig {
	/** Extra rotation applied to the model, in degrees (X, Y, Z). */
	orientation: [number, number, number];
	/** Uniform scale applied after loading; 1 is "as exported". */
	scale: number;
	material: MaterialConfig;
	camera: CameraConfig;
	light: LightConfig;
	wood: WoodConfig;
	/** Ambient/hemisphere fill — deliberately small, just to keep shadows readable. */
	fill: number;
	/** Tone-mapping exposure. */
	exposure: number;
	/** Shadow-map edge length, in pixels. */
	shadowMapSize: number;
	/** Half-width of the shadow camera's ortho frustum, in bounding-sphere radii. */
	shadowSpan: number;
}

export interface ViewerPreset extends Partial<SceneConfig> {
	label?: string;
}
