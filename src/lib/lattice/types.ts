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

export interface BackdropConfig {
	/**
	 * `plain` is an untextured matte surface — no texture downloads, the cast shadow carries
	 * the image. `wood` loads the PBR wood set for the photograph look.
	 */
	mode: 'plain' | 'wood';
	/** Plain-surface colour (only used when `mode` is `plain`). */
	color: string;
	/** Wood mode only: multiplies the colour map. */
	tint: string;
	/** Wood only: width of one texture tile, in bounding-sphere radii. */
	tileRadii: number;
	/** Wood only: degrees to rotate the grain in the plane. */
	grainRotation: number;
	/** Wood only: normal-map strength. */
	normalScale: number;
}

export interface MaterialConfig {
	/** Orange PLA base colour. */
	color: string;
	/** 0–1. Nonmetal plastic wants 0. */
	metalness: number;
	/** Base roughness; the printed-plastic sheen comes from this plus the key light. */
	roughness: number;
	/**
	 * Self-illumination, 0–1. Stands in for the room light bouncing around inside the lattice:
	 * it lifts the object's shaded side without touching the tabletop, which keeps the cast
	 * shadow dark and crisp.
	 */
	glow: number;
	/**
	 * Neutral lift applied in `slope` mode instead of `glow`. A vertex colour multiplies the
	 * base colour, so the orange emissive cannot be used there without tinting the scale; a
	 * small flat white keeps the dark end of the ramp off the floor without shifting hues.
	 */
	slopeGlow: number;
}

/**
 * How the object is coloured.
 *
 * `orange` is the printed-PLA look. `slope` uses the mesh's baked `COLOR_0` attribute — for
 * the sphere figure that is each rod's own angle above horizontal — and is only available
 * on meshes that carry one.
 */
export type ColorMode = 'orange' | 'slope';

export interface SceneConfig {
	/** Which colour mode a viewer opens in. */
	colorMode: ColorMode;
	/**
	 * Let the object shadow itself. Off by default: a real lattice print is lit from every
	 * direction by the room, so it reads much more evenly than a hard shadow-mapped model.
	 * It still casts onto the table either way.
	 */
	selfShadow: boolean;
	/** Extra rotation applied to the model, in degrees (X, Y, Z). */
	orientation: [number, number, number];
	/** Uniform scale applied after loading; 1 is "as exported". */
	scale: number;
	material: MaterialConfig;
	camera: CameraConfig;
	light: LightConfig;
	backdrop: BackdropConfig;
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
