"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicState =
  | "idle"
  | "requesting"
  | "listening"
  | "denied"
  | "unsupported";

type Options = {
  onClap: () => void;
  threshold?: number;
  debounceMs?: number;
};

/**
 * 마이크 입력을 분석해서 박수(짧고 강한 임펄스)를 감지한다.
 * - RMS 가 임계값 초과
 * - 직전 프레임 대비 어택이 빠름 (transient)
 * - debounce 로 한 박수가 여러 번 트리거되지 않게 함
 * - 권한 거부 / 미지원 환경에서는 상태로 노출, 상위에서 탭 fallback 처리
 */
export function useClapDetection({
  onClap,
  threshold = 0.18,
  debounceMs = 250,
}: Options) {
  const [micState, setMicState] = useState<MicState>("idle");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const onClapRef = useRef(onClap);
  const lastClapAtRef = useRef(0);
  const prevRmsRef = useRef(0);

  useEffect(() => {
    onClapRef.current = onClap;
  }, [onClap]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;
    const md = navigator.mediaDevices;
    if (!md || !md.getUserMedia || typeof window.AudioContext === "undefined") {
      setMicState("unsupported");
      return;
    }
    setMicState("requesting");
    try {
      const stream = await md.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.05;
      src.connect(analyser);
      analyserRef.current = analyser;

      const buf = new Float32Array(analyser.fftSize);

      const tick = () => {
        const a = analyserRef.current;
        if (!a) return;
        a.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        const attack = rms - prevRmsRef.current;
        const now = performance.now();
        if (
          rms > threshold &&
          attack > threshold * 0.55 &&
          now - lastClapAtRef.current > debounceMs
        ) {
          lastClapAtRef.current = now;
          onClapRef.current();
        }
        prevRmsRef.current = rms;
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      setMicState("listening");
    } catch {
      setMicState("denied");
    }
  }, [threshold, debounceMs]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { micState, start, stop };
}
