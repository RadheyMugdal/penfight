export class PenFightAudioEngine {
	private ctx: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private slideGain: GainNode | null = null;
	private slideFilter: BiquadFilterNode | null = null;
	private fanGain: GainNode | null = null;
	private isUnlocked = false;

	unlock(): boolean {
		if (this.isUnlocked && this.ctx) {
			if (this.ctx.state === "suspended") {
				this.ctx.resume().catch(() => {});
			}
			return true;
		}

		try {
			const AudioCtxClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext;
			if (!AudioCtxClass) {
				return false;
			}

			this.ctx = new AudioCtxClass();
			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.value = 0.7;

			// Dynamics compressor to avoid clipping
			const comp = this.ctx.createDynamicsCompressor();
			comp.threshold.value = -20;
			comp.knee.value = 18;
			comp.ratio.value = 12;
			this.masterGain.connect(comp);
			comp.connect(this.ctx.destination);

			// Continuous slide friction noise loop
			this.setupSlideLoop();

			// Ceiling fan ambient hum
			this.setupCeilingFan();

			this.isUnlocked = true;
			return true;
		} catch {
			return false;
		}
	}

	private setupSlideLoop(): void {
		if (!(this.ctx && this.masterGain)) {
			return;
		}

		// 2-second white noise loop buffer
		const bufferSize = this.ctx.sampleRate * 2;
		const noiseBuffer = this.ctx.createBuffer(
			1,
			bufferSize,
			this.ctx.sampleRate
		);
		const output = noiseBuffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i += 1) {
			output[i] = Math.random() * 2 - 1;
		}

		const whiteNoise = this.ctx.createBufferSource();
		whiteNoise.buffer = noiseBuffer;
		whiteNoise.loop = true;

		this.slideFilter = this.ctx.createBiquadFilter();
		this.slideFilter.type = "bandpass";
		this.slideFilter.frequency.value = 1200;
		this.slideFilter.Q.value = 1.8;

		this.slideGain = this.ctx.createGain();
		this.slideGain.gain.value = 0;

		whiteNoise.connect(this.slideFilter);
		this.slideFilter.connect(this.slideGain);
		this.slideGain.connect(this.masterGain);

		whiteNoise.start();
	}

	private setupCeilingFan(): void {
		if (!(this.ctx && this.masterGain)) {
			return;
		}

		// Low frequency motor hum
		const osc = this.ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.value = 65;

		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 160;

		this.fanGain = this.ctx.createGain();
		this.fanGain.gain.value = 0.05;

		// Blade rotational wobble LFO (~3.5 Hz)
		const lfo = this.ctx.createOscillator();
		lfo.frequency.value = 3.5;
		const lfoGain = this.ctx.createGain();
		lfoGain.gain.value = 0.02;

		lfo.connect(lfoGain);
		lfoGain.connect(this.fanGain.gain);

		osc.connect(filter);
		filter.connect(this.fanGain);
		this.fanGain.connect(this.masterGain);

		osc.start();
		lfo.start();
	}

	updateSlideSound(maxLinearSpeed: number): void {
		if (!(this.ctx && this.slideGain && this.slideFilter)) {
			return;
		}

		const threshold = 0.02;
		if (maxLinearSpeed < threshold) {
			this.slideGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
			return;
		}

		const targetGain = Math.min(0.28, (maxLinearSpeed - threshold) * 0.45);
		const targetFreq = Math.min(3200, 800 + maxLinearSpeed * 3000);

		this.slideGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.03);
		this.slideFilter.frequency.setTargetAtTime(
			targetFreq,
			this.ctx.currentTime,
			0.03
		);
	}

	playClack(impactSpeed: number): void {
		if (!(this.ctx && this.masterGain)) {
			return;
		}

		const speed = Math.max(0.05, Math.min(1.5, impactSpeed));
		const now = this.ctx.currentTime;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "triangle";
		const baseFreq = 950 + speed * 600;
		osc.frequency.setValueAtTime(baseFreq, now);
		osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

		const volume = Math.min(0.65, 0.15 + speed * 0.4);
		gain.gain.setValueAtTime(volume, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start(now);
		osc.stop(now + 0.06);
	}

	playFlickRelease(): void {
		if (!(this.ctx && this.masterGain)) {
			return;
		}
		const now = this.ctx.currentTime;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "sine";
		osc.frequency.setValueAtTime(320, now);
		osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);

		gain.gain.setValueAtTime(0.4, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start(now);
		osc.stop(now + 0.09);
	}

	playDeskFallThud(): void {
		if (!(this.ctx && this.masterGain)) {
			return;
		}
		const now = this.ctx.currentTime;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = "sine";
		osc.frequency.setValueAtTime(140, now);
		osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

		gain.gain.setValueAtTime(0.5, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start(now);
		osc.stop(now + 0.22);
	}

	playVictoryWhistle(): void {
		if (!(this.ctx && this.masterGain)) {
			return;
		}
		const now = this.ctx.currentTime;

		const bursts = [now, now + 0.15];
		for (const startTime of bursts) {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();

			osc.type = "square";
			osc.frequency.setValueAtTime(2400, startTime);
			osc.frequency.linearRampToValueAtTime(2600, startTime + 0.08);

			gain.gain.setValueAtTime(0.12, startTime);
			gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start(startTime);
			osc.stop(startTime + 0.11);
		}
	}

	playSchoolBell(): void {
		if (!(this.ctx && this.masterGain)) {
			return;
		}
		const now = this.ctx.currentTime;

		const freqs = [520, 1040, 1560];
		for (const f of freqs) {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(f, now);

			gain.gain.setValueAtTime(0.15, now);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start(now);
			osc.stop(now + 0.85);
		}
	}
}
