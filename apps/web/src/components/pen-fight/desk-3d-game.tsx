"use client";

import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
	BENCH_RIVALS,
	type BotRival,
	calculateBotShot,
} from "./ai/bot-policies";
import { PenFightAudioEngine } from "./audio/procedural-audio";
import { getPenSpec } from "./pens/catalog";
import { RapierDeskSimulation, SIM_CONFIG } from "./physics/rapier-desk";
import { Desk3DScene } from "./renderer/desk-3d-scene";

interface Desk3DGameProps {
	ladderIndex: number;
	mode: "solo" | "local";
	onExit: () => void;
	onLadderWin?: (nextIndex: number, wonPenId: string) => void;
	playerNames: [string, string];
	selectedPenId?: string;
}

type Turn = 0 | 1;
type Phase = "idle" | "aiming" | "moving" | "roundEnd" | "matchEnd";

export default function Desk3DGame({
	mode,
	ladderIndex,
	playerNames,
	selectedPenId = "reynolds045",
	onExit,
	onLadderWin,
}: Desk3DGameProps): JSX.Element {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const simRef = useRef<RapierDeskSimulation | null>(null);
	const sceneRef = useRef<Desk3DScene | null>(null);
	const audioRef = useRef<PenFightAudioEngine | null>(null);

	const [turn, setTurn] = useState<Turn>(0);
	const [phase, setPhase] = useState<Phase>("idle");
	const [scores, setScores] = useState<[number, number]>([0, 0]);
	const [roundMessage, setRoundMessage] = useState<string>(
		"Touch your pen and pull back to flick!"
	);
	const [matchWinner, setMatchWinner] = useState<string | null>(null);
	const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const rivalIndex = Math.min(ladderIndex, BENCH_RIVALS.length - 1);
	const rival: BotRival = BENCH_RIVALS[rivalIndex] ?? BENCH_RIVALS[0];

	const p1Spec = getPenSpec(selectedPenId);
	const p2Spec =
		mode === "solo" ? getPenSpec(rival.penId) : getPenSpec("pilotV5");

	const dragRef = useRef<{
		active: boolean;
		penIndex: number;
		strikeT: number;
		startDeskPos: THREE.Vector3;
		currentDeskPos: THREE.Vector3;
	}>({
		active: false,
		currentDeskPos: new THREE.Vector3(),
		penIndex: 0,
		startDeskPos: new THREE.Vector3(),
		strikeT: 0,
	});

	const scoresRef = useRef(scores);
	scoresRef.current = scores;
	const phaseRef = useRef(phase);
	phaseRef.current = phase;
	const turnRef = useRef(turn);
	turnRef.current = turn;

	// Reset for next round
	const resetForNextRound = useCallback(() => {
		if (!(simRef.current && sceneRef.current)) {
			return;
		}
		simRef.current.resetPens(p1Spec, p2Spec);
		setTurn(0);
		setPhase("idle");
		setRoundMessage(`${playerNames[0]}'s turn to flick.`);
	}, [p1Spec, p2Spec, playerNames]);

	// Bot Turn Trigger
	const triggerBotTurn = useCallback(() => {
		if (!simRef.current) {
			return;
		}

		setPhase("aiming");
		setRoundMessage(`${rival.name} is reading the table...`);

		const thinkTime =
			rival.thinkMinMs + Math.random() * (rival.thinkMaxMs - rival.thinkMinMs);

		window.setTimeout(() => {
			if (!simRef.current || phaseRef.current === "matchEnd") {
				return;
			}

			const botPen = simRef.current.pens[1];
			const playerPen = simRef.current.pens[0];
			if (!(botPen && playerPen)) {
				return;
			}

			const botTrans = botPen.body.translation();
			const playerTrans = playerPen.body.translation();

			const shot = calculateBotShot(
				{ x: botTrans.x, z: botTrans.z },
				{ x: playerTrans.x, z: playerTrans.z },
				rival
			);

			audioRef.current?.playFlickRelease();
			simRef.current.applyFlick(
				1,
				shot.power,
				shot.dirX,
				shot.dirZ,
				shot.strikeT
			);

			setPhase("moving");
			setRoundMessage(`${rival.name} flicked!`);
		}, thinkTime);
	}, [rival]);

	// Round resolution referee
	const resolveRound = useCallback(() => {
		if (!simRef.current) {
			return;
		}

		const pens = simRef.current.pens;
		const p1Out = pens[0]?.isOut ?? false;
		const p2Out = pens[1]?.isOut ?? false;
		const currentTurn = turnRef.current;

		let nextScores: [number, number] = [...scoresRef.current];
		let msg = "";

		if (p1Out && p2Out) {
			msg = "Double out! Both pens left the table. Replay the round.";
			setRoundMessage(msg);
			setPhase("roundEnd");
			audioRef.current?.playDeskFallThud();
			window.setTimeout(resetForNextRound, 1800);
			return;
		}

		if (p1Out) {
			nextScores = [nextScores[0], nextScores[1] + 1];
			audioRef.current?.playDeskFallThud();
			if (currentTurn === 0) {
				msg = `${playerNames[0]} flicked off the desk! Self-out. Point to ${playerNames[1]}.`;
			} else {
				msg = `${playerNames[1]} knocks ${playerNames[0]} off the desk! Point to ${playerNames[1]}.`;
			}
		} else if (p2Out) {
			nextScores = [nextScores[0] + 1, nextScores[1]];
			audioRef.current?.playDeskFallThud();
			if (currentTurn === 1) {
				msg = `${playerNames[1]} flicked off the desk! Self-out. Point to ${playerNames[0]}.`;
			} else {
				msg = `${playerNames[0]} knocks ${playerNames[1]} off the desk! Point to ${playerNames[0]}.`;
			}
		} else {
			const nextTurn = currentTurn === 0 ? 1 : 0;
			setTurn(nextTurn);
			setPhase("idle");
			const activeName = nextTurn === 0 ? playerNames[0] : playerNames[1];
			setRoundMessage(`${activeName}'s turn to flick.`);
			if (mode === "solo" && nextTurn === 1) {
				triggerBotTurn();
			}
			return;
		}

		setScores(nextScores);
		setRoundMessage(msg);

		if (nextScores[0] >= 3) {
			setPhase("matchEnd");
			setMatchWinner(playerNames[0]);
			audioRef.current?.playVictoryWhistle();
			if (mode === "solo" && onLadderWin) {
				onLadderWin(ladderIndex + 1, rival.penId);
			}
			return;
		}

		if (nextScores[1] >= 3) {
			setPhase("matchEnd");
			setMatchWinner(playerNames[1]);
			audioRef.current?.playSchoolBell();
			return;
		}

		setPhase("roundEnd");
		window.setTimeout(resetForNextRound, 2000);
	}, [
		playerNames,
		mode,
		ladderIndex,
		rival.penId,
		onLadderWin,
		resetForNextRound,
		triggerBotTurn,
	]);

	useEffect(() => {
		let animId = 0;
		let isDisposed = false;

		async function init() {
			if (!(canvasRef.current && containerRef.current)) {
				return;
			}

			const rect = containerRef.current.getBoundingClientRect();
			const width = rect.width || 800;
			const height = rect.height || 520;

			audioRef.current = new PenFightAudioEngine();

			const sim = await RapierDeskSimulation.create();
			if (isDisposed) {
				sim.dispose();
				return;
			}
			simRef.current = sim;
			sim.resetPens(p1Spec, p2Spec);

			const scene = new Desk3DScene(canvasRef.current, width, height);
			sceneRef.current = scene;
			scene.createPenMesh(p1Spec);
			scene.createPenMesh(p2Spec);

			setIsLoading(false);

			let lastTime = performance.now();
			const loop = (now: number) => {
				if (isDisposed) {
					return;
				}

				const dt = Math.min((now - lastTime) / 1000, 0.05);
				lastTime = now;

				if (simRef.current && sceneRef.current) {
					const subStepDt = SIM_CONFIG.dt;
					let accumulator = dt;
					let isSettled = false;
					while (accumulator >= subStepDt) {
						isSettled = simRef.current.step(now);
						accumulator -= subStepDt;
					}

					const penTransforms = simRef.current.pens.map((p) => {
						const trans = p.body.translation();
						const rot = p.body.rotation();
						return {
							isOut: p.isOut,
							position: { x: trans.x, y: trans.y, z: trans.z },
							rotation: { w: rot.w, x: rot.x, y: rot.y, z: rot.z },
						};
					});
					sceneRef.current.updatePenTransforms(penTransforms);

					let maxSpeed = 0;
					for (const p of simRef.current.pens) {
						if (!p.isOut) {
							const vel = p.body.linvel();
							const spd = Math.hypot(vel.x, vel.y, vel.z);
							if (spd > maxSpeed) {
								maxSpeed = spd;
							}
						}
					}
					if (audioRef.current && audioEnabled) {
						audioRef.current.updateSlideSound(maxSpeed);
					}

					if (phaseRef.current === "moving" && isSettled) {
						resolveRound();
					}

					sceneRef.current.render();
				}

				animId = requestAnimationFrame(loop);
			};

			animId = requestAnimationFrame(loop);
		}

		init().catch(() => {});

		const handleResize = () => {
			if (!(containerRef.current && sceneRef.current)) {
				return;
			}
			const r = containerRef.current.getBoundingClientRect();
			sceneRef.current.handleResize(r.width, r.height);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			isDisposed = true;
			cancelAnimationFrame(animId);
			window.removeEventListener("resize", handleResize);
			simRef.current?.dispose();
			sceneRef.current?.dispose();
		};
	}, [p1Spec, p2Spec, audioEnabled, resolveRound]);

	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (phase !== "idle") {
			return;
		}
		if (mode === "solo" && turn !== 0) {
			return;
		}

		audioRef.current?.unlock();

		const rect = canvasRef.current?.getBoundingClientRect();
		if (!(rect && sceneRef.current && simRef.current)) {
			return;
		}

		const hitPoint = sceneRef.current.screenToDeskPoint(
			e.clientX,
			e.clientY,
			rect
		);
		if (!hitPoint) {
			return;
		}

		const activePenIndex = turn;
		const pen = simRef.current.pens[activePenIndex];
		if (!pen || pen.isOut) {
			return;
		}

		const trans = pen.body.translation();
		const distToPen = Math.hypot(hitPoint.x - trans.x, hitPoint.z - trans.z);

		if (distToPen < 0.055) {
			dragRef.current = {
				active: true,
				currentDeskPos: hitPoint.clone(),
				penIndex: activePenIndex,
				startDeskPos: hitPoint.clone(),
				strikeT: Math.max(-0.9, Math.min(0.9, (hitPoint.z - trans.z) / 0.04)),
			};
			setPhase("aiming");
		}
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!(dragRef.current.active && sceneRef.current && simRef.current)) {
			return;
		}

		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) {
			return;
		}

		const hitPoint = sceneRef.current.screenToDeskPoint(
			e.clientX,
			e.clientY,
			rect
		);
		if (!hitPoint) {
			return;
		}

		dragRef.current.currentDeskPos = hitPoint;

		const dx = dragRef.current.startDeskPos.x - hitPoint.x;
		const dz = dragRef.current.startDeskPos.z - hitPoint.z;
		const pullDist = Math.hypot(dx, dz);

		const maxPullMeters = 0.16;
		const rawPower = Math.min(1, pullDist / maxPullMeters);
		const power = rawPower ** 1.45;

		const dirX = pullDist > 0.005 ? dx / pullDist : 0;
		const dirZ = pullDist > 0.005 ? dz / pullDist : 0;

		const pen = simRef.current.pens[dragRef.current.penIndex];
		if (pen) {
			const trans = pen.body.translation();
			sceneRef.current.updateAimVisualization({
				active: true,
				aimDirection: new THREE.Vector3(dirX, 0, dirZ),
				power,
				pullPoint: hitPoint,
				strikePoint: new THREE.Vector3(trans.x, trans.y, trans.z),
			});
		}
	};

	const handlePointerUp = () => {
		if (!(dragRef.current.active && sceneRef.current && simRef.current)) {
			return;
		}

		dragRef.current.active = false;
		sceneRef.current.updateAimVisualization({
			active: false,
			aimDirection: new THREE.Vector3(),
			power: 0,
			pullPoint: new THREE.Vector3(),
			strikePoint: new THREE.Vector3(),
		});

		const dx =
			dragRef.current.startDeskPos.x - dragRef.current.currentDeskPos.x;
		const dz =
			dragRef.current.startDeskPos.z - dragRef.current.currentDeskPos.z;
		const pullDist = Math.hypot(dx, dz);

		if (pullDist < 0.012) {
			setPhase("idle");
			return;
		}

		const maxPullMeters = 0.16;
		const rawPower = Math.min(1, pullDist / maxPullMeters);
		const power = rawPower ** 1.45;

		const dirX = dx / pullDist;
		const dirZ = dz / pullDist;

		audioRef.current?.playFlickRelease();

		simRef.current.applyFlick(
			dragRef.current.penIndex,
			power,
			dirX,
			dirZ,
			dragRef.current.strikeT
		);

		setPhase("moving");
		setRoundMessage("Shot fired! Watching the slide...");
	};

	const toggleAudio = () => {
		setAudioEnabled((prev) => !prev);
	};

	const headerSubtitle =
		mode === "solo"
			? rival.line
			: `${playerNames[0]} vs ${playerNames[1]} · Best of 5`;

	const headerTitle =
		mode === "solo"
			? `BENCH ${rival.benchNumber}: ${rival.name.toUpperCase()}`
			: "LOCAL DUEL · PASS & PLAY";

	return (
		<div
			className="relative flex w-full select-none flex-col items-center justify-center"
			style={{ fontFamily: "var(--font-hand), cursive" }}
		>
			<header className="mb-2 flex w-full max-w-4xl items-center justify-between rounded-t-lg border-2 border-[#543d2b] bg-[#1b1510] px-4 py-2.5 text-[#f3ede0] shadow-md">
				<div className="flex items-center gap-3">
					<button
						className="rounded border border-amber-800/60 bg-[#2b2118] px-2.5 py-1 text-amber-200 text-xs uppercase tracking-wider hover:bg-[#3d2f22]"
						onClick={onExit}
						type="button"
					>
						← Leave Desk
					</button>
					<div>
						<h2
							className="font-black text-amber-100 text-lg leading-tight tracking-wide"
							style={{ fontFamily: "var(--font-display), Impact, sans-serif" }}
						>
							{headerTitle}
						</h2>
						<p className="text-amber-200/70 text-xs">{headerSubtitle}</p>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 rounded border border-amber-900/40 bg-[#261d15] px-3 py-1">
						<span
							className={`font-black text-sm ${turn === 0 ? "text-amber-400 underline" : "text-amber-100"}`}
						>
							{playerNames[0]}: {scores[0]}
						</span>
						<span className="text-amber-400/40">|</span>
						<span
							className={`font-black text-sm ${turn === 1 ? "text-amber-400 underline" : "text-amber-100"}`}
						>
							{playerNames[1]}: {scores[1]}
						</span>
					</div>
					<button
						className="rounded border border-amber-900/60 bg-[#2b2118] p-1.5 text-amber-200 text-xs"
						onClick={toggleAudio}
						title={audioEnabled ? "Mute Classroom Sounds" : "Unmute"}
						type="button"
					>
						{audioEnabled ? "🔊" : "🔇"}
					</button>
				</div>
			</header>

			<div
				className="relative h-[520px] w-full max-w-4xl cursor-grab overflow-hidden border-2 border-[#543d2b] bg-[#1a140e] shadow-2xl active:cursor-grabbing"
				ref={containerRef}
			>
				<canvas
					className="block h-full w-full"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					ref={canvasRef}
				/>

				{isLoading && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a140e]/90 text-amber-200">
						<p className="animate-pulse text-xl">
							Sharpening pencils & finding seats...
						</p>
					</div>
				)}

				<div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2">
					<div className="rounded border border-amber-900/30 bg-[#f7f2e2] px-4 py-1.5 font-semibold text-[#2b2118] text-sm tracking-wide shadow-md">
						{roundMessage}
					</div>
				</div>

				<div className="pointer-events-none absolute bottom-3 left-4 flex gap-2">
					<div className="flex items-center gap-2 rounded border border-amber-900/40 bg-[#18120c]/85 px-2.5 py-1 text-amber-100 text-xs">
						<span
							className="h-3 w-3 rounded-full border border-white/40"
							style={{ backgroundColor: p1Spec.color }}
						/>
						<span>
							{playerNames[0]}: <strong>{p1Spec.name}</strong>
						</span>
					</div>
					<div className="flex items-center gap-2 rounded border border-amber-900/40 bg-[#18120c]/85 px-2.5 py-1 text-amber-100 text-xs">
						<span
							className="h-3 w-3 rounded-full border border-white/40"
							style={{ backgroundColor: p2Spec.color }}
						/>
						<span>
							{playerNames[1]}: <strong>{p2Spec.name}</strong>
						</span>
					</div>
				</div>

				{phase === "matchEnd" && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
						<article className="w-full max-w-md rounded-lg border-4 border-amber-900 bg-[#f7f2e2] p-6 text-center text-[#2b2118] shadow-2xl">
							<span className="text-4xl">🏆</span>
							<h3
								className="mt-2 font-black text-3xl text-amber-950 uppercase tracking-wide"
								style={{
									fontFamily: "var(--font-display), Impact, sans-serif",
								}}
							>
								{matchWinner} WINS!
							</h3>
							<p className="mt-2 text-sm text-stone-700">
								{matchWinner === playerNames[0] && mode === "solo"
									? `You defeated ${rival.name}! You keep ${rival.name}'s pen: ${p2Spec.name}.`
									: `First to 3 rounds takes the desk. Final score: ${scores[0]} - ${scores[1]}.`}
							</p>

							<div className="mt-5 flex gap-3">
								<button
									className="flex-1 rounded bg-amber-700 py-2.5 font-bold text-white tracking-wide shadow hover:bg-amber-800"
									onClick={resetForNextRound}
									type="button"
								>
									PLAY AGAIN
								</button>
								<button
									className="flex-1 rounded bg-[#2b2118] py-2.5 font-bold text-amber-100 tracking-wide shadow hover:bg-[#3d2f22]"
									onClick={onExit}
									type="button"
								>
									RETURN TO CLASS
								</button>
							</div>
						</article>
					</div>
				)}
			</div>

			<footer className="flex w-full max-w-4xl items-center justify-between rounded-b-lg border-[#543d2b] border-x-2 border-b-2 bg-[#241b14] p-3 text-amber-200/80 text-xs">
				<span>
					💡 Drag your pen to aim. Further pull = greater flick impulse.
					Off-centre strikes impart rotational torque!
				</span>
				<span className="font-bold text-amber-400/90">
					First to 3 rounds wins
				</span>
			</footer>
		</div>
	);
}
