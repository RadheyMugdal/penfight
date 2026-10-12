import RAPIER from "@dimforge/rapier3d-compat";
import type { PenSpec } from "../pens/catalog";

export const DESK_CONFIG = {
	depth: 0.45,
	friction: 0.33,
	height: 0.72,
	outY: -0.04,
	restitution: 0.1,
	thickness: 0.03,
	width: 0.7,
};

export const SIM_CONFIG = {
	dt: 1 / 120,
	gravity: -9.81,
	jMax: 0.0275,
	jMin: 0.0015,
	massAdapt: 0.9,
	maxSubSteps: 6,
	refMassKg: 0.013_72,
	settleAngVel: 0.15,
	settleLinVel: 0.015,
	stableMs: 300,
	strikeRange: 0.9,
	timeoutMs: 5000,
};

let rapierReady: Promise<void> | null = null;
export async function ensureRapier(): Promise<void> {
	if (!rapierReady) {
		rapierReady = RAPIER.init();
	}
	await rapierReady;
}

export interface PenPhysicsInstance {
	body: RAPIER.RigidBody;
	collider: RAPIER.Collider;
	fellAt: number | null;
	halfLength: number;
	isOut: boolean;
	radius: number;
	spec: PenSpec;
}

function generateTriPrismVertices(
	length: number,
	radius: number
): Float32Array {
	const halfL = length / 2;
	const vertices: number[] = [];
	const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
	for (const angle of angles) {
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		vertices.push(x, y, -halfL);
		vertices.push(x, y, halfL);
	}
	return new Float32Array(vertices);
}

function generateHexPrismVertices(
	length: number,
	radius: number
): Float32Array {
	const halfL = length / 2;
	const vertices: number[] = [];
	for (let i = 0; i < 6; i += 1) {
		const angle = (i * Math.PI) / 3;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		vertices.push(x, y, -halfL);
		vertices.push(x, y, halfL);
	}
	return new Float32Array(vertices);
}

export class RapierDeskSimulation {
	world!: RAPIER.World;
	deskBody!: RAPIER.RigidBody;
	pens: PenPhysicsInstance[] = [];
	private quietSince: number | null = null;
	private activeSince: number | null = null;

	static async create(): Promise<RapierDeskSimulation> {
		await ensureRapier();
		const sim = new RapierDeskSimulation();
		sim.initWorld();
		return sim;
	}

	private initWorld(): void {
		const gravity = new RAPIER.Vector3(0, SIM_CONFIG.gravity, 0);
		this.world = new RAPIER.World(gravity);

		const deskBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
			0,
			-DESK_CONFIG.thickness / 2,
			0
		);
		this.deskBody = this.world.createRigidBody(deskBodyDesc);

		const deskColliderDesc = RAPIER.ColliderDesc.cuboid(
			DESK_CONFIG.width / 2,
			DESK_CONFIG.thickness / 2,
			DESK_CONFIG.depth / 2
		)
			.setFriction(DESK_CONFIG.friction)
			.setRestitution(DESK_CONFIG.restitution);

		this.world.createCollider(deskColliderDesc, this.deskBody);
	}

	addPen(spec: PenSpec, x: number, z: number, yaw: number): PenPhysicsInstance {
		const { length, radius } = spec;
		const halfL = Math.max(0.01, (length - 2 * radius) / 2);
		const ySpawn = radius + 0.001;

		const halfYaw = yaw / 2;
		const rot = {
			w: Math.cos(halfYaw),
			x: 0,
			y: Math.sin(halfYaw),
			z: 0,
		};

		const rbDesc = RAPIER.RigidBodyDesc.dynamic()
			.setTranslation(x, ySpawn, z)
			.setRotation(rot)
			.setLinearDamping(0.06)
			.setAngularDamping(0.8)
			.setCcdEnabled(true);

		const body = this.world.createRigidBody(rbDesc);

		let colDesc: RAPIER.ColliderDesc;
		if (spec.shape === "tri") {
			const verts = generateTriPrismVertices(spec.length, spec.radius);
			colDesc =
				RAPIER.ColliderDesc.convexHull(verts) ??
				RAPIER.ColliderDesc.capsule(halfL, radius);
		} else if (spec.shape === "hex") {
			const verts = generateHexPrismVertices(spec.length, spec.radius);
			colDesc =
				RAPIER.ColliderDesc.convexHull(verts) ??
				RAPIER.ColliderDesc.capsule(halfL, radius);
		} else {
			const halfPi = Math.PI / 2;
			const capRot = {
				w: Math.cos(halfPi / 2),
				x: Math.sin(halfPi / 2),
				y: 0,
				z: 0,
			};
			colDesc = RAPIER.ColliderDesc.capsule(halfL, radius).setRotation(capRot);
		}

		colDesc
			.setDensity(spec.density)
			.setFriction(spec.friction)
			.setRestitution(spec.restitution)
			.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

		const collider = this.world.createCollider(colDesc, body);

		const clipDesc = RAPIER.ColliderDesc.cuboid(0.0016, 0.0022, 0.01)
			.setTranslation(0, radius + 0.0015, -halfL * 0.6)
			.setDensity(800)
			.setFriction(spec.friction);
		this.world.createCollider(clipDesc, body);

		const instance: PenPhysicsInstance = {
			body,
			collider,
			fellAt: null,
			halfLength: halfL,
			isOut: false,
			radius,
			spec,
		};

		this.pens.push(instance);
		return instance;
	}

	applyFlick(
		penIndex: number,
		power: number,
		dirX: number,
		dirZ: number,
		strikeT: number
	): void {
		const pen = this.pens[penIndex];
		if (!pen || pen.isOut) {
			return;
		}

		const { body } = pen;
		body.wakeUp();

		const mass = body.mass();
		const massScale =
			SIM_CONFIG.massAdapt > 0
				? (mass / SIM_CONFIG.refMassKg) ** SIM_CONFIG.massAdapt
				: 1;

		const impulseMag =
			(SIM_CONFIG.jMin + power * (SIM_CONFIG.jMax - SIM_CONFIG.jMin)) *
			massScale;

		const rot = body.rotation();
		const qx = rot.x;
		const qy = rot.y;
		const qz = rot.z;
		const qw = rot.w;
		const axisX = 2 * (qx * qz + qw * qy);
		const axisZ = 1 - 2 * (qx * qx + qy * qy);
		const axisLen = Math.hypot(axisX, axisZ) || 1;
		const normAxisX = axisX / axisLen;
		const normAxisZ = axisZ / axisLen;

		const offset = strikeT * pen.halfLength * SIM_CONFIG.strikeRange;
		const trans = body.translation();
		const strikePoint = {
			x: trans.x + normAxisX * offset,
			y: trans.y,
			z: trans.z + normAxisZ * offset,
		};

		const impulse = {
			x: dirX * impulseMag,
			y: 0,
			z: dirZ * impulseMag,
		};

		body.applyImpulseAtPoint(impulse, strikePoint, true);
		this.activeSince = performance.now();
		this.quietSince = null;
	}

	step(nowMs: number): boolean {
		this.world.step();

		for (const pen of this.pens) {
			if (!pen.isOut) {
				const trans = pen.body.translation();
				if (trans.y < DESK_CONFIG.outY) {
					pen.isOut = true;
					pen.fellAt = nowMs;
				}
			}
		}

		return this.checkSettled(nowMs);
	}

	checkSettled(nowMs: number): boolean {
		if (this.activeSince === null) {
			return true;
		}

		const elapsed = nowMs - this.activeSince;
		if (elapsed > SIM_CONFIG.timeoutMs) {
			this.activeSince = null;
			this.quietSince = null;
			return true;
		}

		const allSlow = this.pens.every((pen) => {
			if (pen.isOut) {
				return true;
			}
			const lin = pen.body.linvel();
			const ang = pen.body.angvel();
			const linSpeed = Math.hypot(lin.x, lin.y, lin.z);
			const angSpeed = Math.hypot(ang.x, ang.y, ang.z);
			return (
				linSpeed < SIM_CONFIG.settleLinVel && angSpeed < SIM_CONFIG.settleAngVel
			);
		});

		if (!allSlow) {
			this.quietSince = null;
			return false;
		}

		if (this.quietSince === null) {
			this.quietSince = nowMs;
			return false;
		}

		if (nowMs - this.quietSince >= SIM_CONFIG.stableMs) {
			this.activeSince = null;
			this.quietSince = null;
			return true;
		}

		return false;
	}

	resetPens(pen1Spec: PenSpec, pen2Spec: PenSpec): void {
		for (const pen of this.pens) {
			this.world.removeRigidBody(pen.body);
		}
		this.pens = [];

		const spawnX = DESK_CONFIG.width * 0.26;
		this.addPen(pen1Spec, -spawnX, 0, 0.4);
		this.addPen(pen2Spec, spawnX, 0, Math.PI - 0.4);

		this.activeSince = null;
		this.quietSince = null;
	}

	dispose(): void {
		for (const pen of this.pens) {
			this.world.removeRigidBody(pen.body);
		}
		this.pens = [];
	}
}
