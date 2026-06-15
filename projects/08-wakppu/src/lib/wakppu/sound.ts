/**
 * Web Audio API 로 왁스 깨지는 톤 합성.
 *
 * 두 가지 모드:
 * 1) sustained crackle — 짓누르는 동안 지속되는 "빠지직~~~" 톤.
 *    노이즈 → bandpass → highpass + LFO 로 진폭 자글거림.
 *    그 위에 랜덤 간격으로 짧은 micro-pop 을 끼워 넣어서
 *    "툭…빠지직…뽀자작…" 처럼 흩어지는 결.
 * 2) micro-pop (transient) — 사용자가 화면을 탭하거나
 *    단계가 진행될 때 그 자리에 박는 짧은 임펄스.
 *    saw 톤(고→저 sweep) + 짧은 노이즈 burst 합성.
 *
 * toneHint(light/medium/heavy) 가 base freq 대역을, stage 가
 * gain / decay multiplier 를 정함. 매 호출마다 freq/decay/gain 이
 * 정해진 범위 안에서 랜덤이므로 동일 사운드 반복 없음.
 */

import type { CrackStage, ToneHint } from "./types";

type ToneBase = {
  /** sustain noise bandpass center 범위 */
  bpFreq: [number, number];
  bpQ: [number, number];
  /** micro-pop saw 출발/도착 freq */
  popHi: [number, number];
  popLo: [number, number];
  /** micro-pop 길이 (ms) */
  popDur: [number, number];
  /** micro-pop 간격(짓누르는 동안) (ms) */
  popGap: [number, number];
};

const HINT_BASE: Record<ToneHint, ToneBase> = {
  light: {
    bpFreq: [1600, 3400],
    bpQ: [2.5, 4.5],
    popHi: [2400, 4200],
    popLo: [220, 420],
    popDur: [22, 55],
    popGap: [55, 130],
  },
  medium: {
    bpFreq: [900, 2000],
    bpQ: [2.2, 4.0],
    popHi: [1500, 2900],
    popLo: [150, 320],
    popDur: [35, 80],
    popGap: [70, 170],
  },
  heavy: {
    bpFreq: [380, 1100],
    bpQ: [1.8, 3.2],
    popHi: [900, 1800],
    popLo: [80, 220],
    popDur: [55, 110],
    popGap: [90, 230],
  },
};

const STAGE_MUL: Record<CrackStage, { gain: number; rate: number; decay: number }> = {
  0: { gain: 0, rate: 1, decay: 1 },
  1: { gain: 0.5, rate: 0.7, decay: 0.85 },
  2: { gain: 0.7, rate: 1.0, decay: 1.0 },
  3: { gain: 0.9, rate: 1.4, decay: 1.15 },
  4: { gain: 1.05, rate: 1.9, decay: 1.3 },
  5: { gain: 1.25, rate: 2.5, decay: 1.5 },
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// 지속 crackle 상태
type SustainHandles = {
  noise: AudioBufferSourceNode;
  bp: BiquadFilterNode;
  hp: BiquadFilterNode;
  amp: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  popTimer: number | null;
};
let sustain: SustainHandles | null = null;

// ─── 외부 오디오 파일 우선 사용 (유튜브에서 받은 mp3 등) ──────────────
// public/sfx/crack/crack-01.mp3 ~ crack-NN.mp3 가 있으면 그걸 micro-pop 으로 재생.
// public/sfx/sustained.mp3 가 있으면 그걸 sustained crackle 로 loop 재생.
// 둘 다 없으면 아래의 합성 사운드(playMicroPop/startCrackle) 그대로 사용.

const SAMPLE_PATHS = Array.from(
  { length: 12 },
  (_, i) => `/sfx/crack/crack-${String(i + 1).padStart(2, "0")}.mp3`,
);
const SUSTAINED_PATH = "/sfx/sustained.mp3";

let availableSamples: string[] = [];
let sustainedPath: string | null = null;
let assetsChecked = false;
let sustainedAudio: HTMLAudioElement | null = null;

async function checkAssets() {
  if (assetsChecked) return;
  assetsChecked = true;
  if (typeof window === "undefined") return;
  const checks = await Promise.all(
    SAMPLE_PATHS.map((p) =>
      fetch(p, { method: "HEAD" })
        .then((r) => (r.ok ? p : null))
        .catch(() => null),
    ),
  );
  availableSamples = checks.filter((p): p is string => p !== null);
  try {
    const r = await fetch(SUSTAINED_PATH, { method: "HEAD" });
    if (r.ok) sustainedPath = SUSTAINED_PATH;
  } catch {}
}

function playSample(volume = 1): boolean {
  if (availableSamples.length === 0) return false;
  const path =
    availableSamples[Math.floor(Math.random() * availableSamples.length)];
  const a = new Audio(path);
  a.volume = Math.max(0, Math.min(1, volume));
  // 자연스러운 다양성 위한 미세 pitch jitter
  a.playbackRate = 0.92 + Math.random() * 0.16;
  void a.play().catch(() => {});
  return true;
}

function startSustainedAudio(volume = 1): boolean {
  if (!sustainedPath) return false;
  if (sustainedAudio) {
    sustainedAudio.volume = volume;
    return true;
  }
  const a = new Audio(sustainedPath);
  a.loop = true;
  a.volume = volume;
  void a.play().catch(() => {});
  sustainedAudio = a;
  return true;
}

function stopSustainedAudio() {
  if (!sustainedAudio) return;
  const a = sustainedAudio;
  // 짧은 fade out
  const start = a.volume;
  const steps = 8;
  let i = 0;
  const id = window.setInterval(() => {
    i++;
    a.volume = Math.max(0, start * (1 - i / steps));
    if (i >= steps) {
      a.pause();
      window.clearInterval(id);
    }
  }, 22);
  sustainedAudio = null;
}

export function ensureAudio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  void checkAssets();
  return ctx;
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeLoopNoiseBuffer(seconds: number) {
  const c = ctx!;
  const len = Math.max(1, Math.floor(seconds * c.sampleRate));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  // 종이/왁스 깨지는 듯한 결을 흉내 — 흰 노이즈에 미세 자글거림
  for (let i = 0; i < len; i++) {
    // 흰 노이즈
    let s = Math.random() * 2 - 1;
    // 가끔 spike (얇은 균열 톤)
    if (Math.random() < 0.003) s = (Math.random() * 2 - 1) * 1.6;
    d[i] = s;
  }
  return buf;
}

/**
 * 짓누르기 시작 — 지속 crackle 톤이 흘러가기 시작.
 * 이미 켜져있으면 stage/tone 만 갱신.
 */
export function startCrackle(stage: CrackStage, tone: ToneHint) {
  const c = ensureAudio();
  const mg = masterGain;
  if (!c || !mg) return;
  if (stage === 0) return;

  // 외부 sustained.mp3 가 있으면 그걸 loop 로 우선 사용
  if (startSustainedAudio(0.4 + stage * 0.08)) {
    schedulePopLoop(stage, tone);
    return;
  }

  const base = HINT_BASE[tone];
  const mul = STAGE_MUL[stage];
  const now = c.currentTime;

  if (sustain) {
    // freq/gain 만 부드럽게 따라가기
    const newFreq = rand(base.bpFreq[0], base.bpFreq[1]);
    sustain.bp.frequency.cancelScheduledValues(now);
    sustain.bp.frequency.linearRampToValueAtTime(newFreq, now + 0.08);
    const newGain = rand(0.18, 0.3) * mul.gain;
    sustain.amp.gain.cancelScheduledValues(now);
    sustain.amp.gain.linearRampToValueAtTime(newGain, now + 0.05);
    schedulePopLoop(stage, tone);
    return;
  }

  // 처음 진입
  const noise = c.createBufferSource();
  noise.buffer = makeLoopNoiseBuffer(2.0);
  noise.loop = true;

  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = rand(base.bpFreq[0], base.bpFreq[1]);
  bp.Q.value = rand(base.bpQ[0], base.bpQ[1]);

  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 200;

  const amp = c.createGain();
  amp.gain.setValueAtTime(0, now);
  const targetGain = rand(0.2, 0.32) * mul.gain;
  amp.gain.linearRampToValueAtTime(targetGain, now + 0.04);

  // LFO 로 진폭을 자글자글 흔들어 "지직~~" 결 만들기
  const lfo = c.createOscillator();
  lfo.type = "sawtooth";
  lfo.frequency.value = 38 + Math.random() * 22;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.45;
  lfo.connect(lfoGain);
  lfoGain.connect(amp.gain);

  noise.connect(bp);
  bp.connect(hp);
  hp.connect(amp);
  amp.connect(mg);

  noise.start(now);
  lfo.start(now);

  sustain = { noise, bp, hp, amp, lfo, lfoGain, popTimer: null };
  schedulePopLoop(stage, tone);
}

function schedulePopLoop(stage: CrackStage, tone: ToneHint) {
  if (!sustain) return;
  if (sustain.popTimer !== null) {
    window.clearTimeout(sustain.popTimer);
    sustain.popTimer = null;
  }
  const base = HINT_BASE[tone];
  const mul = STAGE_MUL[stage];
  const gap = rand(base.popGap[0], base.popGap[1]) / mul.rate;
  sustain.popTimer = window.setTimeout(() => {
    if (!sustain) return;
    playMicroPop(stage, tone, 0.7);
    schedulePopLoop(stage, tone);
  }, gap);
}

/**
 * 짓누르기 종료 — 지속 톤 fade out.
 */
export function stopCrackle() {
  // sustained mp3 가 켜져있으면 그걸 먼저 끔
  stopSustainedAudio();
  const c = ctx;
  const s = sustain;
  if (!c || !s) return;
  const now = c.currentTime;
  s.amp.gain.cancelScheduledValues(now);
  s.amp.gain.setValueAtTime(s.amp.gain.value, now);
  s.amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  s.noise.stop(now + 0.22);
  s.lfo.stop(now + 0.22);
  if (s.popTimer !== null) window.clearTimeout(s.popTimer);
  sustain = null;
}

/**
 * 한 번의 짧은 균열 임펄스 — saw pitch sweep + 노이즈 burst.
 */
export function playMicroPop(stage: CrackStage, tone: ToneHint, scale = 1) {
  const c = ensureAudio();
  const mg = masterGain;
  if (!c || !mg) return;
  if (stage === 0) return;

  // 외부 crack-NN.mp3 풀이 있으면 그 중 랜덤 재생
  const sampleVol = Math.min(1, 0.5 + stage * 0.1) * scale;
  if (playSample(sampleVol)) return;

  const base = HINT_BASE[tone];
  const mul = STAGE_MUL[stage];
  const now = c.currentTime;
  const dur = rand(base.popDur[0], base.popDur[1]) / 1000;

  // Layer A — saw pitch sweep ("딱→뚝" 톤)
  const saw = c.createOscillator();
  saw.type = "sawtooth";
  const hi = rand(base.popHi[0], base.popHi[1]);
  const lo = rand(base.popLo[0], base.popLo[1]);
  saw.frequency.setValueAtTime(hi, now);
  saw.frequency.exponentialRampToValueAtTime(lo, now + dur);

  const sawHp = c.createBiquadFilter();
  sawHp.type = "highpass";
  sawHp.frequency.value = 220;

  const sawAmp = c.createGain();
  const sawGain = rand(0.18, 0.28) * mul.gain * scale;
  sawAmp.gain.setValueAtTime(0, now);
  sawAmp.gain.linearRampToValueAtTime(sawGain, now + 0.001);
  sawAmp.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  saw.connect(sawHp);
  sawHp.connect(sawAmp);
  sawAmp.connect(mg);
  saw.start(now);
  saw.stop(now + dur + 0.02);

  // Layer B — 짧은 노이즈 burst (자글거림)
  const noise = c.createBufferSource();
  noise.buffer = makeLoopNoiseBuffer(Math.max(0.04, dur + 0.02));
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = rand(base.bpFreq[0], base.bpFreq[1]);
  bp.Q.value = rand(base.bpQ[0], base.bpQ[1]);
  const noiseAmp = c.createGain();
  const nGain = rand(0.14, 0.22) * mul.gain * scale;
  noiseAmp.gain.setValueAtTime(0, now);
  noiseAmp.gain.linearRampToValueAtTime(nGain, now + 0.002);
  noiseAmp.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.9);

  noise.connect(bp);
  bp.connect(noiseAmp);
  noiseAmp.connect(mg);
  noise.start(now);
  noise.stop(now + dur + 0.02);

  // 완파 단계만 sub thud 추가
  if (stage === 5 && scale >= 1) {
    const sub = c.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(120 + Math.random() * 40, now);
    sub.frequency.exponentialRampToValueAtTime(55, now + 0.2);
    const sg = c.createGain();
    sg.gain.setValueAtTime(0, now);
    sg.gain.linearRampToValueAtTime(0.45, now + 0.005);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    sub.connect(sg);
    sg.connect(mg);
    sub.start(now);
    sub.stop(now + 0.28);
  }
}

/**
 * 다시 만들기 — 부드러운 sine sweep.
 */
export function playReassemble() {
  const c = ensureAudio();
  const mg = masterGain;
  if (!c || !mg) return;
  const now = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(220, now);
  o.frequency.exponentialRampToValueAtTime(660, now + 0.45);
  const g = c.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.18, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  o.connect(g);
  g.connect(mg);
  o.start(now);
  o.stop(now + 0.55);
}

/**
 * 완파 직후 작은 환호 — 짧은 chord.
 */
export function playJingle() {
  const c = ensureAudio();
  const mg = masterGain;
  if (!c || !mg) return;
  const now = c.currentTime;
  const notes = [880, 1108.73, 1318.51];
  notes.forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = c.createGain();
    const start = now + i * 0.045;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.14, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
    o.connect(g);
    g.connect(mg);
    o.start(start);
    o.stop(start + 0.36);
  });
}
