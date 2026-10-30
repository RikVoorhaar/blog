/**
 * The Three.js side of the lattice viewer: builds the tabletop scene, loads one mesh, and
 * renders **on demand** rather than in a permanent loop.
 *
 * Everything visual is driven by `SceneConfig`; nothing here should need editing to retune a
 * camera, light, orange or wood grain. This module is imported lazily (see `mount.ts`), so
 * Three.js only reaches pages that actually contain a viewer.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { loadArrayBuffer, loadImage } from './assets';
import { resolveScene } from './presets';
import type { SceneConfig } from './types';

export interface MountOptions {
	src: string;
	preset?: string;
	canvas: HTMLCanvasElement;
	/** Texture URLs; supplied by the Astro component so Vite can hash them. */
	textures: { color: string; normal: string };
	onReady?: () => void;
}

export interface ViewerHandle {
	reset: () => void;
	dispose: () => void;
}

const DEG = Math.PI / 180;

/** Spherical direction helper: azimuth measured around +Y, elevation from the horizon. */
function direction(azimuthDeg: number, elevationDeg: number): THREE.Vector3 {
	const az = azimuthDeg * DEG;
	const el = elevationDeg * DEG;
	return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
}

export async function mount({ src, preset, canvas, textures, onReady }: MountOptions) {
	const config: SceneConfig = resolveScene(preset);

	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: 'high-performance'
	});
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = config.exposure;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	const scene = new THREE.Scene();
	// Matches the backdrop so there is never a visible seam or horizon.
	scene.background = new THREE.Color(
		config.backdrop.mode === 'wood' ? '#241a12' : config.backdrop.color
	);

	const camera = new THREE.PerspectiveCamera(config.camera.fov, 1, 0.01, 5000);
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.enablePan = false;
	// Never let the user orbit under the tabletop.
	controls.maxPolarAngle = Math.PI / 2 - 0.06;
	controls.minPolarAngle = 0.12;

	// ---------------------------------------------------------------- on-demand rendering
	let frame = 0;
	let dirty = true;
	let ticking = false;

	const tick = () => {
		frame = 0;
		ticking = true;
		const moved = controls.update();
		ticking = false;
		if (moved || dirty) {
			renderer.render(scene, camera);
			dirty = false;
		}
		// Keep going only while damping is still moving the camera. `requestRender` is a
		// no-op mid-tick, so exactly one chain of frames can ever exist.
		if (moved) frame = requestAnimationFrame(tick);
	};

	const requestRender = () => {
		dirty = true;
		if (ticking || frame) return;
		frame = requestAnimationFrame(tick);
	};

	controls.addEventListener('change', requestRender);

	// ---------------------------------------------------------------------- size handling
	const resize = () => {
		const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
		const height = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
		// Two canvases on a retina screen is a lot of pixels; 1.5 is visually indistinguishable.
		const cap = width < 640 ? 1.25 : 1.5;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		requestRender();
	};
	const resizeObserver = new ResizeObserver(resize);

	// ------------------------------------------------------------------------ model load
	const loader = new GLTFLoader();
	const buffer = await loadArrayBuffer(src);
	const gltf = await loader.parseAsync(buffer, '');
	const model = gltf.scene;

	model.rotation.set(
		config.orientation[0] * DEG,
		config.orientation[1] * DEG,
		config.orientation[2] * DEG
	);
	model.scale.setScalar(config.scale);
	model.updateMatrixWorld(true);

	// Re-seat on the table: keep the exported print orientation, only translate.
	const box = new THREE.Box3().setFromObject(model);
	const size = new THREE.Vector3();
	const centre = new THREE.Vector3();
	box.getSize(size);
	box.getCenter(centre);
	model.position.x -= centre.x;
	model.position.z -= centre.z;
	model.position.y -= box.min.y;
	model.updateMatrixWorld(true);

	const radius = Math.max(size.length() / 2, 1e-3);

	// --------------------------------------------------------------- orange PLA material
	const plaColor = new THREE.Color(config.material.color);
	const material = new THREE.MeshStandardMaterial({
		color: plaColor,
		metalness: config.material.metalness,
		roughness: config.material.roughness,
		// A whisper of self-illumination in the object's own colour: with self-shadowing off,
		// this is what keeps the underside of the lattice from going muddy, without lifting the
		// tabletop and washing out the cast shadow.
		emissive: plaColor,
		emissiveIntensity: config.material.glow,
		flatShading: false
	});

	model.traverse((child) => {
		if (!(child as THREE.Mesh).isMesh) return;
		const mesh = child as THREE.Mesh;
		mesh.material = material;
		mesh.castShadow = true;
		// Off by default: self-shadowing a lattice produces dense hard shadow bands that read
		// nothing like a real print, which is lit from every side by the room.
		mesh.receiveShadow = config.selfShadow;
	});
	scene.add(model);

	// ----------------------------------------------------------------------- backdrop
	// 'plain' is a flat matte surface: no texture downloads at all, and the cast shadow does
	// the visual work. 'wood' swaps in the PBR set for the photograph look.
	const tile = radius * config.backdrop.tileRadii;
	const tableSize = tile * 40;
	// Lambert on purpose: a diffuse-only surface has no specular lobe, so the tabletop never
	// flares when the camera swings toward the key light. It still receives the cast shadow.
	let surfaceMaterial: THREE.MeshLambertMaterial;
	let surfaceMaps: THREE.Texture[] = [];

	if (config.backdrop.mode === 'wood') {
		const [colorImg, normalImg] = await Promise.all([
			loadImage(textures.color),
			loadImage(textures.normal)
		]);

		const anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
		const maps = {
			map: new THREE.Texture(colorImg),
			normalMap: new THREE.Texture(normalImg)
		};
		maps.map.colorSpace = THREE.SRGBColorSpace;
		const repeat = tableSize / tile;
		for (const texture of Object.values(maps)) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.anisotropy = anisotropy;
			texture.repeat.set(repeat, repeat);
			texture.rotation = config.backdrop.grainRotation * DEG;
			texture.center.set(0.5, 0.5);
			texture.needsUpdate = true;
		}

		surfaceMaps = Object.values(maps);
		surfaceMaterial = new THREE.MeshLambertMaterial({
			color: new THREE.Color(config.backdrop.tint),
			...maps,
			normalScale: new THREE.Vector2(config.backdrop.normalScale, config.backdrop.normalScale)
		});
	} else {
		surfaceMaterial = new THREE.MeshLambertMaterial({
			color: new THREE.Color(config.backdrop.color)
		});
	}

	const table = new THREE.Mesh(
		new THREE.PlaneGeometry(tableSize, tableSize, 1, 1),
		surfaceMaterial
	);
	table.rotation.x = -Math.PI / 2;
	table.receiveShadow = true;
	scene.add(table);

	// ------------------------------------------------------------------ lighting + shadows
	const key = new THREE.DirectionalLight(config.light.color, config.light.intensity);
	const lightDir = direction(config.light.azimuth, config.light.elevation);
	const lightDistance = radius * 12;
	key.position.copy(lightDir).multiplyScalar(lightDistance);
	key.target.position.set(0, size.y * 0.35, 0);
	key.castShadow = true;
	key.shadow.mapSize.set(config.shadowMapSize, config.shadowMapSize);
	key.shadow.bias = -0.00035;
	key.shadow.normalBias = radius * 0.008;
	key.shadow.radius = 2;

	const shadowSpan = radius * config.shadowSpan;
	const shadowCamera = key.shadow.camera as THREE.OrthographicCamera;
	shadowCamera.left = -shadowSpan;
	shadowCamera.right = shadowSpan;
	shadowCamera.top = shadowSpan;
	shadowCamera.bottom = -shadowSpan;
	shadowCamera.near = radius * 0.5;
	shadowCamera.far = lightDistance + radius * 8;
	shadowCamera.updateProjectionMatrix();
	scene.add(key);
	scene.add(key.target);

	// Uniform ambient: lifts every surface equally, so shaded struts stay close in tone to the
	// lit ones while the table's directional cast shadow keeps its contrast.
	scene.add(new THREE.AmbientLight('#fff3e2', config.fill));

	// A little sky/ground gradient on top, plus a soft bounce from the opposite side.
	const fill = new THREE.HemisphereLight('#f7ece0', '#6b4a33', config.fill * 0.35);
	scene.add(fill);

	const bounce = new THREE.DirectionalLight('#ffe2bd', config.fill * 0.3);
	bounce.position.copy(direction(config.light.azimuth + 180, 42)).multiplyScalar(lightDistance);
	scene.add(bounce);

	// -------------------------------------------------------------------------- framing
	const target = new THREE.Vector3(centre.x, size.y * 0.42, centre.z);
	// Shift the look-at along the cast-shadow direction so the object sits opposite the
	// shadow and the empty tabletop where the shadow lands stays in frame.
	const lightGround = direction(config.light.azimuth, 0).multiplyScalar(-1);
	target.addScaledVector(lightGround, config.camera.targetShift * radius);

	const applyCamera = () => {
		const dir = direction(config.camera.azimuth, config.camera.elevation);
		camera.position.copy(target).addScaledVector(dir, radius * config.camera.distance);
		controls.target.copy(target);
		controls.minDistance = radius * 1.6;
		controls.maxDistance = radius * 16;
		camera.near = radius * 0.05;
		camera.far = radius * 120;
		camera.updateProjectionMatrix();
		controls.update();
		requestRender();
	};
	applyCamera();

	const reset = () => {
		const toPos = target
			.clone()
			.addScaledVector(
				direction(config.camera.azimuth, config.camera.elevation),
				radius * config.camera.distance
			);
		// Snap when the user asked for reduced motion; otherwise ease so the jump is not jarring.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			camera.position.copy(toPos);
			controls.target.copy(target);
			controls.update();
			requestRender();
			return;
		}

		const fromPos = camera.position.clone();
		const fromTarget = controls.target.clone();
		const start = performance.now();
		const duration = 320;
		const step = () => {
			const t = Math.min(1, (performance.now() - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			camera.position.lerpVectors(fromPos, toPos, eased);
			controls.target.lerpVectors(fromTarget, target, eased);
			controls.update();
			requestRender();
			if (t < 1) requestAnimationFrame(step);
		};
		step();
	};

	resizeObserver.observe(canvas.parentElement ?? canvas);
	resize();

	// The light and the object are both static, so the shadow map is rendered once and then
	// reused. Re-rendering an 80k-triangle depth pass every frame was the main interaction cost.
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	requestRender();
	onReady?.();

	// -------------------------------------------------------------------------- teardown
	let disposed = false;
	const dispose = () => {
		if (disposed) return;
		disposed = true;
		if (frame) cancelAnimationFrame(frame);
		frame = 0;

		controls.removeEventListener('change', requestRender);
		controls.dispose();
		resizeObserver.disconnect();

		// Textures were created per viewer from shared images, so they are ours to free.
		surfaceMaps.forEach((texture) => texture.dispose());
		surfaceMaterial.dispose();
		material.dispose();
		table.geometry.dispose();
		model.traverse((child) => {
			const mesh = child as THREE.Mesh;
			if (mesh.isMesh) mesh.geometry?.dispose();
		});

		renderer.dispose();
		renderer.forceContextLoss();
	};

	return { reset, dispose } satisfies ViewerHandle;
}

export type { SceneConfig };
