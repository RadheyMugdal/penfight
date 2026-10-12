"use client";

import { type CSSProperties, type JSX, useEffect, useState } from "react";
import { BENCH_RIVALS, type BotRival } from "./ai/bot-policies";
import Desk3DGame from "./desk-3d-game";
import { getAllPensList, getPenSpec, type PenSpec } from "./pens/catalog";

type Mode = "menu" | "solo" | "local";

const PAPER_STYLE: CSSProperties = {
	backgroundColor: "#f7f2e2",
	backgroundImage:
		"repeating-linear-gradient(transparent 0 30px, rgba(70,110,180,0.2) 30px 31px), linear-gradient(90deg, transparent 0 56px, rgba(220,80,80,0.4) 56px 58px, transparent 58px)",
};

const DISPLAY_FONT: CSSProperties = {
	fontFamily: "var(--font-display), 'Anton', Impact, sans-serif",
	letterSpacing: "0.04em",
};

const HAND_FONT: CSSProperties = {
	fontFamily: "var(--font-hand), 'Patrick Hand', cursive",
};

function getButtonCardClass(isSelected: boolean, isUnlocked: boolean): string {
	if (isSelected) {
		return "border-blue-700 bg-blue-50/80 ring-2 ring-blue-500";
	}
	if (isUnlocked) {
		return "border-stone-300 bg-stone-50/70 hover:border-stone-400";
	}
	return "cursor-not-allowed border-stone-200 bg-stone-100 opacity-40";
}

export default function PenFightHome(): JSX.Element {
	const [mode, setMode] = useState<Mode>("menu");
	const [ladderIndex, setLadderIndex] = useState<number>(0);
	const [playerName, setPlayerName] = useState<string>("You");
	const [selectedPenId, setSelectedPenId] = useState<string>("reynolds045");
	const [unlockedPens, setUnlockedPens] = useState<string[]>([
		"reynolds045",
		"nataraj-621",
		"gripper",
	]);

	useEffect(() => {
		try {
			const savedLadder = Number(localStorage.getItem("pf-ladder") ?? "0");
			if (Number.isFinite(savedLadder) && savedLadder >= 0) {
				setLadderIndex(Math.min(savedLadder, BENCH_RIVALS.length));
			}

			const savedName = localStorage.getItem("pf-name");
			if (savedName && savedName.trim().length >= 2) {
				setPlayerName(savedName.trim().slice(0, 16));
			}

			const savedPens = localStorage.getItem("pf-unlocked-pens");
			if (savedPens) {
				const parsed = JSON.parse(savedPens);
				if (Array.isArray(parsed) && parsed.length > 0) {
					setUnlockedPens(parsed);
				}
			}

			const lastPen = localStorage.getItem("pf-selected-pen");
			if (lastPen) {
				setSelectedPenId(lastPen);
			}
		} catch {
			/* localStorage unavailable; fall back to initial state */
		}
	}, []);

	const saveName = (value: string): void => {
		const clean = value.trim().slice(0, 16);
		const finalName = clean.length === 0 ? "You" : clean;
		setPlayerName(finalName);
		try {
			localStorage.setItem("pf-name", finalName);
		} catch {
			/* ignore */
		}
	};

	const handleSelectPen = (id: string): void => {
		setSelectedPenId(id);
		try {
			localStorage.setItem("pf-selected-pen", id);
		} catch {
			/* ignore */
		}
	};

	const handleLadderWin = (nextIndex: number, wonPenId: string): void => {
		const clampedNext = Math.min(nextIndex, BENCH_RIVALS.length);
		setLadderIndex(clampedNext);

		setUnlockedPens((prev) => {
			const updated = prev.includes(wonPenId) ? prev : [...prev, wonPenId];
			try {
				localStorage.setItem("pf-ladder", String(clampedNext));
				localStorage.setItem("pf-unlocked-pens", JSON.stringify(updated));
			} catch {
				/* ignore */
			}
			return updated;
		});
	};

	const rivalIdx = Math.min(ladderIndex, BENCH_RIVALS.length - 1);
	const currentRival: BotRival = BENCH_RIVALS[rivalIdx] ?? BENCH_RIVALS[0];

	if (mode !== "menu") {
		const names: [string, string] =
			mode === "solo"
				? [playerName, currentRival.name]
				: ["Player 1", "Player 2"];

		return (
			<div className="py-4">
				<Desk3DGame
					ladderIndex={ladderIndex}
					mode={mode}
					onExit={() => setMode("menu")}
					onLadderWin={handleLadderWin}
					playerNames={names}
					selectedPenId={selectedPenId}
				/>
			</div>
		);
	}

	const currentSelectedPen = getPenSpec(selectedPenId);

	return (
		<div className="grid gap-6 py-6" style={HAND_FONT}>
			<section
				className="rounded-xl border-4 border-amber-950/60 p-7 shadow-2xl"
				style={PAPER_STYLE}
			>
				<p className="text-center font-bold text-blue-900 text-sm uppercase tracking-widest">
					✎&nbsp;&nbsp;THE UNOFFICIAL SPORT OF THE LAST BENCH&nbsp;&nbsp;✎
				</p>
				<h1
					className="mt-1 text-center font-black text-5xl text-blue-950 uppercase"
					style={DISPLAY_FONT}
				>
					PEN FIGHT 3D
				</h1>
				<p className="mt-1 text-center text-blue-900/80 text-lg">
					Same desks, same pens, real 3D physics. Winner keeps the pen.
				</p>

				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<article className="flex flex-col justify-between rounded-lg border-2 border-blue-900/30 bg-white/70 p-5 shadow-sm">
						<div>
							<p className="font-bold text-blue-900/70 text-xs uppercase tracking-wider">
								Solo Campaign · 11 Benches to the Trimax
							</p>
							<h2
								className="mt-0.5 font-black text-2xl text-blue-950"
								style={DISPLAY_FONT}
							>
								CLASSROOM CHAMPIONSHIP
							</h2>
							<p className="mt-1 text-blue-950/80 text-sm leading-relaxed">
								Next opponent:{" "}
								<strong>
									Bench {currentRival.benchNumber}: {currentRival.name}
								</strong>
								<br />
								<span className="text-stone-600 text-xs italic">
									"{currentRival.tell}"
								</span>
							</p>

							<div
								aria-label={`${ladderIndex} of ${BENCH_RIVALS.length} beaten`}
								className="mt-3 flex flex-wrap items-center gap-1.5"
								role="img"
							>
								{BENCH_RIVALS.map((r, i) => (
									<span
										className={`h-3.5 w-3.5 rounded-full border ${
											i < ladderIndex
												? "border-red-700 bg-red-600 shadow-sm"
												: "border-blue-900/40 bg-transparent"
										}`}
										key={r.id}
										title={`Bench ${r.benchNumber}: ${r.name}`}
									/>
								))}
								<span className="ml-1 text-lg" title="Reynolds Trimax Trophy">
									🏆
								</span>
							</div>

							<div className="mt-4">
								<label
									className="block font-bold text-blue-950 text-xs uppercase tracking-wider"
									htmlFor="pf-player-name"
								>
									Your Name (written on pencil box)
								</label>
								<input
									className="mt-1 w-full rounded border border-blue-900/40 bg-white px-3 py-1.5 text-base text-blue-950"
									defaultValue={playerName}
									id="pf-player-name"
									maxLength={16}
									onBlur={(e) => saveName(e.target.value)}
								/>
							</div>
						</div>

						<button
							className="mt-5 w-full rounded-md bg-red-600 px-4 py-3.5 font-black text-white text-xl tracking-wider shadow-md transition-all hover:bg-red-700 active:scale-[0.99]"
							onClick={() => setMode("solo")}
							style={DISPLAY_FONT}
							type="button"
						>
							CHALLENGE BENCH {currentRival.benchNumber} →
						</button>
					</article>

					<article className="flex flex-col justify-between rounded-lg border-2 border-amber-900/30 bg-amber-50/70 p-5 shadow-sm">
						<div>
							<p className="font-bold text-amber-900/70 text-xs uppercase tracking-wider">
								Multiplayer Modes
							</p>
							<h2
								className="mt-0.5 font-black text-2xl text-amber-950"
								style={DISPLAY_FONT}
							>
								PLAY WITH PEOPLE
							</h2>
							<ul className="mt-3 space-y-3">
								<li className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-white/80 p-3 shadow-xs">
									<div>
										<div className="flex items-center gap-2">
											<strong className="text-amber-950 text-base">
												PASS & PLAY
											</strong>
											<span className="rounded bg-yellow-400 px-1.5 py-0.5 font-bold text-black text-xs">
												LOCAL
											</span>
										</div>
										<p className="text-stone-600 text-xs">
											2 players · Alternate turns on this screen
										</p>
									</div>
									<button
										className="rounded bg-amber-800 px-3 py-1.5 font-black text-amber-100 text-sm tracking-wide hover:bg-amber-900"
										onClick={() => setMode("local")}
										style={DISPLAY_FONT}
										type="button"
									>
										START →
									</button>
								</li>

								<li className="flex items-center justify-between rounded-lg border border-stone-400 border-dashed bg-stone-100/60 p-3 opacity-75">
									<div>
										<strong className="text-base text-stone-700">
											DESK DUEL LINK
										</strong>
										<p className="text-stone-500 text-xs">
											Send a room link to play across 2 phones
										</p>
									</div>
									<span className="font-bold text-stone-500 text-xs uppercase">
										LINK READY
									</span>
								</li>
							</ul>
						</div>

						<div className="mt-4 rounded border border-blue-900/20 bg-white/80 p-3">
							<span className="font-bold text-stone-600 text-xs uppercase">
								Active Pen:
							</span>
							<div className="mt-1 flex items-center gap-2">
								<span
									className="h-4 w-4 rounded-full border border-black/30"
									style={{ backgroundColor: currentSelectedPen.color }}
								/>
								<span className="font-bold text-blue-950">
									{currentSelectedPen.name}
								</span>
								<span className="text-stone-500 text-xs italic">
									({currentSelectedPen.flavour})
								</span>
							</div>
						</div>
					</article>
				</div>
			</section>

			<section className="rounded-xl border-2 border-stone-400 bg-white p-6 shadow-md">
				<h3
					className="font-black text-2xl text-blue-950 uppercase"
					style={DISPLAY_FONT}
				>
					YOUR PENCIL BOX ({unlockedPens.length} UNLOCKED)
				</h3>
				<p className="mb-4 text-sm text-stone-600">
					Defeat classmates on the bench to claim their pens for your
					collection.
				</p>

				<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
					{getAllPensList().map((pen: PenSpec) => {
						const isUnlocked = unlockedPens.includes(pen.id);
						const isSelected = selectedPenId === pen.id;
						const cardStyle = getButtonCardClass(isSelected, isUnlocked);

						return (
							<button
								className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${cardStyle}`}
								disabled={!isUnlocked}
								key={pen.id}
								onClick={() => handleSelectPen(pen.id)}
								type="button"
							>
								<div className="flex w-full items-center justify-between">
									<div className="flex items-center gap-2">
										<span
											className="h-3.5 w-3.5 rounded-full border border-black/20"
											style={{ backgroundColor: pen.color }}
										/>
										<strong className="text-sm text-stone-900">
											{pen.name}
										</strong>
									</div>
									{isSelected && (
										<span className="font-bold text-blue-700 text-xs">
											EQUIPPED
										</span>
									)}
									{!isUnlocked && (
										<span className="text-stone-500 text-xs">🔒 LOCKED</span>
									)}
								</div>

								<p className="mt-1 line-clamp-2 text-stone-600 text-xs italic">
									{pen.flavour}
								</p>

								<div className="mt-2 flex gap-2 text-[11px] text-stone-500">
									<span>Friction: {pen.friction}</span>
									<span>•</span>
									<span>Bounce: {pen.restitution}</span>
									{pen.shape !== undefined ? (
										<>
											<span>•</span>
											<span className="font-bold text-amber-700 uppercase">
												{pen.shape}
											</span>
										</>
									) : null}
								</div>
							</button>
						);
					})}
				</div>
			</section>

			<details className="rounded-xl border border-amber-900/30 bg-amber-50 p-5 shadow-xs">
				<summary className="cursor-pointer font-bold text-amber-950 text-base">
					Official Last Bench Rules
				</summary>
				<ul className="mt-2 list-disc space-y-1.5 pl-5 text-amber-950/85 text-sm">
					<li>
						<strong>Two pens, one desk, turns:</strong> Flick only your
						designated pen.
					</li>
					<li>
						<strong>Slingshot Touch:</strong> Drag back from your pen to aim and
						power your flick. Further pull = greater impulse.
					</li>
					<li>
						<strong>Rotational Torque:</strong> Striking near the tip or cap
						imparts violent spin; striking the center produces straight linear
						thrust.
					</li>
					<li>
						<strong>The Fall Rule:</strong> A pen must physically leave the
						wooden desk surface to lose the round.
					</li>
					<li>
						<strong>Knockout:</strong> Knock opponent off while staying on desk
						to score a point. Self-out grants a point to opponent. Double-out
						replays the round.
					</li>
					<li>
						<strong>Match Length:</strong> First to 3 rounds wins the match.
						Winner keeps the loser's pen!
					</li>
				</ul>
			</details>
		</div>
	);
}
