/**
 * Web Audio API 로 "오도독/빠직/딱/사각" 톤을 즉석 합성.
 *
 * 핵심 아이디어:
 * - 짧은 흰색 노이즈 burst 를 만든다.
 * - Bandpass filter 로 음색을 좁힌다 (높은 freq 일수록 가벼움, 낮을수록 묵직함).
 * - Gain envelope (attack/decay) 로 "딱" 하고 끊긴다.
 * - 매번 freq/Q/decay/gain 을 랜덤화해서 절대 같은 소리가 안 나오게 함.
 * - 단계와 toneHint 두 축으로 음색 베이스를 잡고, 그 위에 랜덤 변동.
 */

import type { CrackStage, ToneHint } from "./types";

type TonePreset = {
  freq: [number, number]; // bandpass center freq 범위 (Hz)
  q: [number, number];
  attack: [number, number]; // ms
  decay: [number, number]; // ms
  gain: [number, number];
  noiseDur: [number, number]; // ms
};

// toneHint 별 베이스 음색
const HINT_BASE: Record<ToneHint, TonePreset> = {
  light: {
    freq: [2400, 5200],
    q: [4, 9],
    attack: [2, 6],
    decay: [40, 90],
    gain: [0.4, 0.7],
    noiseDur: [25, 55],
  },
  medium: {
    freq: [1100, 2600],
    q: [3, 7],
    attack: [3, 8],
    decay: [70, 140],
    gain: [0.55, 0.85],
    noiseDur: [40, 95],
  },
  heavy: {
    freq: [380, 1200],
    q: [2.5, 5],
    attack: [5, 12],
    decay: [120, 240],
    gain: [0.7, 0.95],
    noiseDur: [60, 140],
  },
};

// 단계별 멀티플라이어
const STAGE_MUL: Record<CrackStage, { gain: number; freq: number; decay: number }> = {
  0: { gain: 0, freq: 1, decay: 1 },
  1: { gain: 0.55, freq: 1.15, decay: 0.85 }, // 작은 균열: 약하고 가볍게
  2: { gain: 0.75, freq: 1.05, decay: 1.0 },
  3: { gain: 0.95, freq: 0.95, decay: 1.15 }, // 파편: 묵직해짐
  4: { gain: 1.05, freq: 0.85, decay: 1.3 },  // 슬라임 노출: 더 묵직
  5: { gain: 1.2, freq: 0.7, decay: 1.6 },    // 완파: 가장 묵직 + 길게
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

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
  return ctx;
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeNoiseBuffer(durationMs: number) {
  const c = ctx!;
  const len = Math.max(1, Math.floor((durationMs / 1000) * c.sampleRate));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  // 흰 노이즈
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/**
 * 한 번의 crack 사운드를 합성해 즉시 재생.
 * 같은 (stage, tone) 이라도 매번 freq/Q/decay/gain 이 흔들려서 다른 소리가 남.
 */
export function playCrack(stage: CrackStage, tone: ToneHint) {
  const c = ensureAudio();
  if (!c || !masterGain) return;
  if (stage === 0) return;

  const base = HINT_BASE[tone];
  const mul = STAGE_MUL[stage];

  const freq = rand(base.freq[0], base.freq[1]) * mul.freq;
  const q = rand(base.q[0], base.q[1]);
  const attack = rand(base.attack[0], base.attack[1]) / 1000;
  const decay = (rand(base.decay[0], base.decay[1]) / 1000) * mul.decay;
  const gain = rand(base.gain[0], base.gain[1]) * mul.gain;
  const noiseDur = rand(base.noiseDur[0], base.noiseDur[1]) * mul.decay;

  const now = c.currentTime;

  // 노이즈 burst
  const src = c.createBufferSource();
  src.buffer = makeNoiseBuffer(noiseDur);

  // Bandpass — "톤"을 결정
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = q;

  // 살짝 하이패스로 너무 둔한 저역 잘라내기
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 180;

  // Envelope
  const g = c.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

  src.connect(bp);
  bp.connect(hp);
  hp.connect(g);
  g.connect(masterGain);

  src.start(now);
  src.stop(now + attack + decay + 0.05);

  // 완파면 살짝 깊은 thud(서브 톤) 한 겹 추가
  if (stage === 5) {
    const sub = c.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(110 + Math.random() * 30, now);
    sub.frequency.exponentialRampToValueAtTime(55, now + 0.18);
    const sg = c.createGain();
    sg.gain.setValueAtTime(0, now);
    sg.gain.linearRampToValueAtTime(0.5, now + 0.005);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    sub.connect(sg);
    sg.connect(masterGain);
    sub.start(now);
    sub.stop(now + 0.25);
  }
}

/**
 * 다시 만들기 — 부드러운 정렬 톤.
 */
export function playReassemble() {
  const c = ensureAudio();
  if (!c || !masterGain) return;
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
  g.connect(masterGain);
  o.start(now);
  o.stop(now + 0.55);
}

/**
 * 완파 후 작은 환호 — 짧은 chord.
 */
export function playJingle() {
  const c = ensureAudio();
  const mg = masterGain;
  if (!c || !mg) return;
  const now = c.currentTime;
  const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6
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
