import { DESK_CONFIG } from "../physics/rapier-desk";

export interface BotRival {
	aimNoiseDeg: number;
	benchNumber: number;
	edgeGuardDist: number;
	edgeGuardPower: number;
	id: string;
	line: string;
	name: string;
	penId: string;
	powerNoise: number;
	skill: number;
	tell: string;
	thinkMaxMs: number;
	thinkMinMs: number;
}

export const BENCH_RIVALS: BotRival[] = [
	{
		aimNoiseDeg: 24,
		benchNumber: 1,
		edgeGuardDist: 0.04,
		edgeGuardPower: 0.7,
		id: "bench-1",
		line: "Sir is watching the board! Flick quickly!",
		name: "Chintu (1st Bench)",
		penId: "reynolds045",
		powerNoise: 0.32,
		skill: 0.22,
		tell: "He rushes every shot and doesn't notice the edge.",
		thinkMaxMs: 700,
		thinkMinMs: 400,
	},
	{
		aimNoiseDeg: 18,
		benchNumber: 2,
		edgeGuardDist: 0.06,
		edgeGuardPower: 0.6,
		id: "bench-2",
		line: "Rohit clicks his Jetter twice before every flick.",
		name: "Rohit",
		penId: "class9d-jetter",
		powerNoise: 0.25,
		skill: 0.35,
		tell: "Fast aggressive drives, clean line leaves no time to recover.",
		thinkMaxMs: 850,
		thinkMinMs: 500,
	},
	{
		aimNoiseDeg: 14,
		benchNumber: 3,
		edgeGuardDist: 0.08,
		edgeGuardPower: 0.5,
		id: "bench-3",
		line: "The Finegrip's rubber band stops exactly where she wants.",
		name: "Nidhi",
		penId: "class9d-finegrip",
		powerNoise: 0.2,
		skill: 0.45,
		tell: "Defensive patient shots; aims for your tip to make you spin.",
		thinkMaxMs: 950,
		thinkMinMs: 600,
	},
	{
		aimNoiseDeg: 12,
		benchNumber: 4,
		edgeGuardDist: 0.09,
		edgeGuardPower: 0.45,
		id: "bench-4",
		line: "That fat Uni-ball roller moves cheap and knocks hard.",
		name: "Kunal",
		penId: "class9e-eye",
		powerNoise: 0.18,
		skill: 0.52,
		tell: "Loves bank shots along the side margin.",
		thinkMaxMs: 900,
		thinkMinMs: 550,
	},
	{
		aimNoiseDeg: 9.5,
		benchNumber: 5,
		edgeGuardDist: 0.1,
		edgeGuardPower: 0.4,
		id: "bench-5",
		line: "Heavy gel pen. Sits planted until he chooses to move it.",
		name: "Ajay",
		penId: "class9d-hyspeed",
		powerNoise: 0.15,
		skill: 0.6,
		tell: "Direct head-on collision shots with heavy momentum.",
		thinkMaxMs: 1050,
		thinkMinMs: 650,
	},
	{
		aimNoiseDeg: 7.5,
		benchNumber: 6,
		edgeGuardDist: 0.11,
		edgeGuardPower: 0.38,
		id: "bench-6",
		line: "Black metal Rotomac. Holds table center and hits like a bat.",
		name: "Anjali",
		penId: "class9e-rotomac",
		powerNoise: 0.12,
		skill: 0.68,
		tell: "Calculates angles carefully before touching the pen.",
		thinkMaxMs: 1100,
		thinkMinMs: 700,
	},
	{
		aimNoiseDeg: 6.0,
		benchNumber: 7,
		edgeGuardDist: 0.12,
		edgeGuardPower: 0.35,
		id: "bench-7",
		line: "Changes the contact angle instead of repeating the direct hit.",
		name: "Sameer",
		penId: "pilotV5",
		powerNoise: 0.1,
		skill: 0.75,
		tell: "Flicks your pen cap to spin your pen sideways.",
		thinkMaxMs: 1150,
		thinkMinMs: 750,
	},
	{
		aimNoiseDeg: 4.8,
		benchNumber: 8,
		edgeGuardDist: 0.12,
		edgeGuardPower: 0.32,
		id: "bench-8",
		line: "Ma'am allows fountain pens, so she brings the vintage Hero.",
		name: "Pooja",
		penId: "champ-hero",
		powerNoise: 0.08,
		skill: 0.82,
		tell: "Front-weighted metal cap creates devastating torque on contact.",
		thinkMaxMs: 1200,
		thinkMinMs: 800,
	},
	{
		aimNoiseDeg: 3.8,
		benchNumber: 9,
		edgeGuardDist: 0.13,
		edgeGuardPower: 0.3,
		id: "bench-9",
		line: "The teacher's steel Parker Vector. Dead weight, clean execution.",
		name: "Vikram",
		penId: "parker",
		powerNoise: 0.06,
		skill: 0.88,
		tell: "Never rushes. Punishes every overextended shot.",
		thinkMaxMs: 1300,
		thinkMinMs: 850,
	},
	{
		aimNoiseDeg: 2.8,
		benchNumber: 10,
		edgeGuardDist: 0.14,
		edgeGuardPower: 0.28,
		id: "bench-10",
		line: "He has The Hulk in his geometry box. Planted like an anchor.",
		name: "Monitor Rohan",
		penId: "lab-brass",
		powerNoise: 0.05,
		skill: 0.94,
		tell: "Takes the safe center desk spot and lets you fly off.",
		thinkMaxMs: 1400,
		thinkMinMs: 900,
	},
	{
		aimNoiseDeg: 1.8,
		benchNumber: 11,
		edgeGuardDist: 0.15,
		edgeGuardPower: 0.25,
		id: "boss-trimax",
		line: "The legendary Reynolds Trimax. Triangular, never rolls, stops where it wants.",
		name: "Last Bench Champion (Zoya)",
		penId: "reynolds-trimax",
		powerNoise: 0.03,
		skill: 1.0,
		tell: "Absolute mastery of pen fight. Unforgiving precision.",
		thinkMaxMs: 1500,
		thinkMinMs: 950,
	},
];

export interface BotShotResult {
	dirX: number;
	dirZ: number;
	power: number;
	strikeT: number;
}

export function calculateBotShot(
	botPos: { x: number; z: number },
	targetPos: { x: number; z: number },
	rival: BotRival
): BotShotResult {
	const dx = targetPos.x - botPos.x;
	const dz = targetPos.z - botPos.z;
	const dist = Math.hypot(dx, dz) || 0.01;

	// Base aim angle
	let aimAngle = Math.atan2(dz, dx);

	// Add skill-based Gaussian noise
	const maxNoiseRad = (rival.aimNoiseDeg * Math.PI) / 180;
	const noise = (Math.random() - 0.5) * 2 * maxNoiseRad;
	aimAngle += noise;

	// Check table edge proximity
	const halfW = DESK_CONFIG.width / 2;
	const halfD = DESK_CONFIG.depth / 2;
	const distToEdgeX = halfW - Math.abs(botPos.x);
	const distToEdgeZ = halfD - Math.abs(botPos.z);
	const minEdgeDist = Math.min(distToEdgeX, distToEdgeZ);

	// Base power calculation
	let power = 0.35 + (dist / 0.7) * 0.55;
	power += (Math.random() - 0.5) * 2 * rival.powerNoise;

	// If close to edge, guard against self-out
	if (minEdgeDist < rival.edgeGuardDist) {
		power = Math.min(power, rival.edgeGuardPower);
	}

	power = Math.max(0.15, Math.min(1.0, power));

	// Determine strike position along pen body (-1 to 1)
	let strikeT = 0;
	if (rival.skill > 0.4 && Math.random() < 0.65) {
		const sign = Math.random() > 0.5 ? 1 : -1;
		strikeT = sign * (0.3 + Math.random() * 0.45);
	}

	return {
		dirX: Math.cos(aimAngle),
		dirZ: Math.sin(aimAngle),
		power,
		strikeT,
	};
}
