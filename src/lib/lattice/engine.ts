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
	textures: { color: string; normal: string; roughness: string };
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
	// Safety net before the table is visible: a plain warm brown, not black.
	scene.background = new THREE.Color('#2c1f16');

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

	const renderFrame = () => {
		frame = 0;
		const moved = controls.update();
		if (moved || dirty) {
			renderer.render(scene, camera);
			dirty = false;
		}
		if (moved || dirty) frame = requestAnimationFrame(renderFrame);
	};

	const requestRender = () => {
		dirty = true;
		if (!frame) frame = requestAnimationFrame(renderFrame);
	};

	controls.addEventListener('change', requestRender);

	// ---------------------------------------------------------------------- size handling
	const resize = () => {
		const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
		const height = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
		const cap = width < 640 ? 1.5 : 1.75;
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
	const material = new THREE.MeshStandardMaterial({
		color: new THREE.Color(config.material.color),
		metalness: config.material.metalness,
		roughness: config.material.roughness,
		flatShading: false
	});

	model.traverse((child) => {
		if (!(child as THREE.Mesh).isMesh) return;
		const mesh = child as THREE.Mesh;
		mesh.material = material;
		mesh.castShadow = true;
		mesh.receiveShadow = true;
	});
	scene.add(model);

	// -------------------------------------------------------------------- wooden tabletop
	const [colorImg, normalImg, roughnessImg] = await Promise.all([
		loadImage(textures.color),
		loadImage(textures.normal),
		loadImage(textures.roughness)
	]);

	const anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
	const woodMaps = {
		map: new THREE.Texture(colorImg),
		normalMap: new THREE.Texture(normalImg),
		roughnessMap: new THREE.Texture(roughnessImg)
	};
	woodMaps.map.colorSpace = THREE.SRGBColorSpace;
	for (const texture of Object.values(woodMaps)) {
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.anisotropy = anisotropy;
		texture.needsUpdate = true;
	}

	const tile = radius * config.wood.tileRadii;
	const tableSize = tile * 40;
	const repeat = tableSize / tile;
	Object.values(woodMaps).forEach((texture) => texture.repeat.set(repeat, repeat));
	woodMaps.map.rotation =
		woodMaps.normalMap.rotation =
		woodMaps.roughnessMap.rotation =
			config.wood.grainRotation * DEG;
	woodMaps.map.center.set(0.5, 0.5);
	woodMaps.normalMap.center.set(0.5, 0.5);
	woodMaps.roughnessMap.center.set(0.5, 0.5);

	const woodMaterial = new THREE.MeshStandardMaterial({
		color: new THREE.Color(config.wood.tint),
		map: woodMaps.map,
		normalMap: woodMaps.normalMap,
		roughnessMap: woodMaps.roughnessMap,
		normalScale: new THREE.Vector2(0.5, 0.5),
		roughness: config.wood.roughness,
		metalness: 0
	});

	const table = new THREE.Mesh(new THREE.PlaneGeometry(tableSize, tableSize, 1, 1), woodMaterial);
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

	// Warm sky fill: keeps the shaded orange readable without flattening the contrast.
	// It must stay warm — a blue fill desaturates the orange into salmon.
	const fill = new THREE.HemisphereLight('#f7ece0', '#6b4a33', config.fill * 0.5);
	scene.add(fill);

	// A warm bounce from the opposite side, standing in for light returning off the table.
	const bounce = new THREE.DirectionalLight('#ffe2bd', config.fill * 0.55);
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
		Object.values(woodMaps).forEach((texture) => texture.dispose());
		woodMaterial.dispose();
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
