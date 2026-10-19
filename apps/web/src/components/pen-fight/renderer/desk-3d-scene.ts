import {
	AmbientLight,
	BoxGeometry,
	BufferGeometry,
	CanvasTexture,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DirectionalLight,
	Group,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Plane,
	PlaneGeometry,
	Raycaster,
	RepeatWrapping,
	Scene,
	SphereGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";
import type { PenSpec } from "../pens/catalog";
import { DESK_CONFIG } from "../physics/rapier-desk";

export interface AimVisualization {
	active: boolean;
	aimDirection: Vector3;
	power: number;
	pullPoint: Vector3;
	strikePoint: Vector3;
}

export class Desk3DScene {
	scene: Scene;
	camera: PerspectiveCamera;
	renderer: WebGLRenderer;
	private deskMesh: Mesh | null = null;
	private penMeshes: Group[] = [];
	private readonly aimArrowGroup: Group = new Group();
	private aimArrowShaft: Mesh | null = null;
	private aimArrowHead: Mesh | null = null;
	private aimPullLine: Line | null = null;
	private strikeDotMesh: Mesh | null = null;
	private readonly raycaster = new Raycaster();
	private readonly deskPlane = new Plane(new Vector3(0, 1, 0), 0);

	constructor(canvas: HTMLCanvasElement, width: number, height: number) {
		this.scene = new Scene();
		this.scene.background = new Color("#1a140e");

		this.camera = new PerspectiveCamera(46, width / height, 0.05, 50);
		this.camera.position.set(0, 0.44, 0.42);
		this.camera.lookAt(0, 0, 0);

		this.renderer = new WebGLRenderer({
			antialias: true,
			canvas,
			powerPreference: "high-performance",
		});
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;

		this.setupLighting();
		this.createDesk();
		this.setupAimIndicators();
	}

	private setupLighting(): void {
		const ambientLight = new AmbientLight("#fef3c7", 0.9);
		this.scene.add(ambientLight);

		const dirLight = new DirectionalLight("#fffbeb", 1.8);
		dirLight.position.set(0.6, 1.2, 0.5);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 4;
		const d = 0.6;
		dirLight.shadow.camera.left = -d;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = -d;
		dirLight.shadow.bias = -0.0005;
		this.scene.add(dirLight);

		const fillLight = new DirectionalLight("#bfdbfe", 0.6);
		fillLight.position.set(-0.6, 0.8, -0.4);
		this.scene.add(fillLight);
	}

	private createDesk(): void {
		const { depth, thickness, width } = DESK_CONFIG;

		const textureCanvas = document.createElement("canvas");
		textureCanvas.width = 1024;
		textureCanvas.height = 1024;
		const ctx = textureCanvas.getContext("2d");
		if (ctx) {
			ctx.fillStyle = "#8a532a";
			ctx.fillRect(0, 0, 1024, 1024);

			for (let i = 0; i < 180; i += 1) {
				const y = Math.random() * 1024;
				ctx.fillStyle = `rgba(80, 42, 18, ${0.08 + Math.random() * 0.12})`;
				ctx.fillRect(0, y, 1024, 1 + Math.random() * 4);
			}

			ctx.strokeStyle = "rgba(40, 20, 8, 0.25)";
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.arc(850, 220, 45, 0, Math.PI * 1.5);
			ctx.stroke();

			ctx.strokeStyle = "rgba(60, 30, 10, 0.4)";
			ctx.lineWidth = 3;
			ctx.strokeRect(16, 16, 992, 992);
		}

		const deskTexture = new CanvasTexture(textureCanvas);
		deskTexture.wrapS = RepeatWrapping;
		deskTexture.wrapT = RepeatWrapping;

		const deskGeometry = new BoxGeometry(width, thickness, depth);
		const deskMaterial = new MeshStandardMaterial({
			map: deskTexture,
			metalness: 0.05,
			roughness: 0.65,
		});

		this.deskMesh = new Mesh(deskGeometry, deskMaterial);
		this.deskMesh.position.set(0, -thickness / 2, 0);
		this.deskMesh.receiveShadow = true;
		this.scene.add(this.deskMesh);

		const floorGeo = new PlaneGeometry(12, 12);
		const floorMat = new MeshStandardMaterial({
			color: "#18120c",
			roughness: 0.95,
		});
		const floorMesh = new Mesh(floorGeo, floorMat);
		floorMesh.rotation.x = -Math.PI / 2;
		floorMesh.position.y = -0.72;
		floorMesh.receiveShadow = true;
		this.scene.add(floorMesh);
	}

	private setupAimIndicators(): void {
		this.aimArrowGroup.visible = false;

		const shaftGeo = new CylinderGeometry(0.003, 0.003, 0.1, 8);
		const arrowMat = new MeshBasicMaterial({
			color: "#ef4444",
			opacity: 0.9,
			transparent: true,
		});
		this.aimArrowShaft = new Mesh(shaftGeo, arrowMat);
		this.aimArrowShaft.rotation.x = Math.PI / 2;
		this.aimArrowShaft.position.z = 0.05;
		this.aimArrowGroup.add(this.aimArrowShaft);

		const headGeo = new ConeGeometry(0.008, 0.024, 8);
		this.aimArrowHead = new Mesh(headGeo, arrowMat);
		this.aimArrowHead.rotation.x = Math.PI / 2;
		this.aimArrowHead.position.z = 0.11;
		this.aimArrowGroup.add(this.aimArrowHead);

		this.scene.add(this.aimArrowGroup);

		const pullLineGeo = new BufferGeometry().setFromPoints([
			new Vector3(0, 0, 0),
			new Vector3(0, 0, 0),
		]);
		const pullLineMat = new LineBasicMaterial({
			color: "#f59e0b",
			linewidth: 3,
		});
		this.aimPullLine = new Line(pullLineGeo, pullLineMat);
		this.aimPullLine.visible = false;
		this.scene.add(this.aimPullLine);

		const dotGeo = new SphereGeometry(0.004, 8, 8);
		const dotMat = new MeshBasicMaterial({ color: "#fbbf24" });
		this.strikeDotMesh = new Mesh(dotGeo, dotMat);
		this.strikeDotMesh.visible = false;
		this.scene.add(this.strikeDotMesh);
	}

	createPenMesh(spec: PenSpec): Group {
		const penGroup = new Group();
		const { length, radius } = spec;
		const halfL = length / 2;

		const bodyMat = new MeshStandardMaterial({
			color: spec.color,
			metalness: 0.1,
			roughness: 0.35,
		});

		const capMat = new MeshStandardMaterial({
			color: spec.capColor,
			metalness: 0.2,
			roughness: 0.25,
		});

		const metalNibMat = new MeshStandardMaterial({
			color: "#e2e8f0",
			metalness: 0.85,
			roughness: 0.15,
		});

		if (spec.shape === "tri") {
			const triGeo = new CylinderGeometry(radius, radius, length * 0.72, 3);
			const barrel = new Mesh(triGeo, bodyMat);
			barrel.rotation.x = Math.PI / 2;
			barrel.castShadow = true;
			penGroup.add(barrel);

			const capGeo = new CylinderGeometry(
				radius * 1.05,
				radius * 1.05,
				length * 0.28,
				3
			);
			const cap = new Mesh(capGeo, capMat);
			cap.rotation.x = Math.PI / 2;
			cap.position.z = -halfL * 0.65;
			cap.castShadow = true;
			penGroup.add(cap);
		} else if (spec.shape === "hex") {
			const hexGeo = new CylinderGeometry(radius, radius, length * 0.88, 6);
			const barrel = new Mesh(hexGeo, bodyMat);
			barrel.rotation.x = Math.PI / 2;
			barrel.castShadow = true;
			penGroup.add(barrel);

			const coneGeo = new ConeGeometry(radius, length * 0.12, 6);
			const woodCone = new Mesh(
				coneGeo,
				new MeshStandardMaterial({ color: "#d97706", roughness: 0.8 })
			);
			woodCone.rotation.x = Math.PI / 2;
			woodCone.position.z = halfL * 0.94;
			penGroup.add(woodCone);
		} else {
			const barrelGeo = new CylinderGeometry(radius, radius, length * 0.68, 16);
			const barrel = new Mesh(barrelGeo, bodyMat);
			barrel.rotation.x = Math.PI / 2;
			barrel.castShadow = true;
			penGroup.add(barrel);

			const capGeo = new CylinderGeometry(
				radius * 1.08,
				radius * 1.08,
				length * 0.32,
				16
			);
			const cap = new Mesh(capGeo, capMat);
			cap.rotation.x = Math.PI / 2;
			cap.position.z = -halfL * 0.62;
			cap.castShadow = true;
			penGroup.add(cap);

			const tipGeo = new ConeGeometry(radius * 0.9, length * 0.08, 16);
			const tip = new Mesh(tipGeo, metalNibMat);
			tip.rotation.x = Math.PI / 2;
			tip.position.z = halfL * 0.85;
			penGroup.add(tip);

			const clipGeo = new BoxGeometry(
				radius * 0.45,
				radius * 0.7,
				length * 0.22
			);
			const clip = new Mesh(clipGeo, capMat);
			clip.position.set(0, radius * 1.25, -halfL * 0.6);
			clip.castShadow = true;
			penGroup.add(clip);
		}

		this.scene.add(penGroup);
		this.penMeshes.push(penGroup);
		return penGroup;
	}

	updatePenTransforms(
		pens: Array<{
			isOut: boolean;
			position: { x: number; y: number; z: number };
			rotation: { w: number; x: number; y: number; z: number };
		}>
	): void {
		for (let i = 0; i < pens.length; i += 1) {
			const penData = pens[i];
			const mesh = this.penMeshes[i];
			if (!(penData && mesh)) {
				continue;
			}

			mesh.position.set(
				penData.position.x,
				penData.position.y,
				penData.position.z
			);
			mesh.quaternion.set(
				penData.rotation.x,
				penData.rotation.y,
				penData.rotation.z,
				penData.rotation.w
			);

			if (penData.isOut && penData.position.y < -0.15) {
				mesh.visible = false;
			} else {
				mesh.visible = true;
			}
		}
	}

	updateAimVisualization(aim: AimVisualization): void {
		if (
			!(
				this.aimArrowShaft &&
				this.aimArrowHead &&
				this.aimPullLine &&
				this.strikeDotMesh
			)
		) {
			return;
		}

		if (!aim.active) {
			this.aimArrowGroup.visible = false;
			this.aimPullLine.visible = false;
			this.strikeDotMesh.visible = false;
			return;
		}

		this.aimArrowGroup.visible = true;
		this.aimPullLine.visible = true;
		this.strikeDotMesh.visible = true;

		this.strikeDotMesh.position.copy(aim.strikePoint);
		this.strikeDotMesh.position.y += 0.006;

		this.aimArrowGroup.position.copy(this.strikeDotMesh.position);
		const arrowLen = Math.max(0.04, aim.power * 0.16);
		this.aimArrowShaft.scale.set(1, 1, arrowLen / 0.1);
		this.aimArrowShaft.position.z = arrowLen / 2;
		this.aimArrowHead.position.z = arrowLen + 0.012;

		const targetPoint = this.aimArrowGroup.position
			.clone()
			.add(aim.aimDirection);
		this.aimArrowGroup.lookAt(targetPoint);

		const points = [
			this.strikeDotMesh.position.clone(),
			new Vector3(aim.pullPoint.x, 0.006, aim.pullPoint.z),
		];
		this.aimPullLine.geometry.setFromPoints(points);
	}

	screenToDeskPoint(
		clientX: number,
		clientY: number,
		rect: DOMRect
	): Vector3 | null {
		const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
		const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

		this.raycaster.setFromCamera(new Vector2(ndcX, ndcY), this.camera);
		const target = new Vector3();
		const hit = this.raycaster.ray.intersectPlane(this.deskPlane, target);
		return hit ? target : null;
	}

	handleResize(width: number, height: number): void {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	render(): void {
		this.renderer.render(this.scene, this.camera);
	}

	clearPens(): void {
		for (const mesh of this.penMeshes) {
			this.scene.remove(mesh);
		}
		this.penMeshes = [];
	}

	dispose(): void {
		this.clearPens();
		if (this.deskMesh) {
			this.scene.remove(this.deskMesh);
		}
		this.scene.remove(this.aimArrowGroup);
		if (this.aimPullLine) {
			this.scene.remove(this.aimPullLine);
		}
		if (this.strikeDotMesh) {
			this.scene.remove(this.strikeDotMesh);
		}
		this.renderer.dispose();
	}
}
