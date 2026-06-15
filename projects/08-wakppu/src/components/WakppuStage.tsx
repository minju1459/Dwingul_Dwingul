"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WakppuCanvas, { type WakppuCanvasHandle } from "./WakppuCanvas";
import VariantPicker from "./VariantPicker";
import CustomMaker from "./CustomMaker";
import RebuildButton from "./RebuildButton";
import Stats from "./Stats";
import { VARIANTS } from "@/lib/wakppu/variants";
import type { WakppuVariant, CrackStage } from "@/lib/wakppu/types";
import {
  ensureAudio,
  playJingle,
  playReassemble,
  startCrackle,
  stopCrackle,
  playMicroPop,
} from "@/lib/wakppu/sound";

const STORAGE_KEY = "wakppu:stats:v1";
const STREAK_WINDOW_MS = 1400;

type StoredStats = { total: number };

function loadStats(): StoredStats {
  if (typeof window === "undefined") return { total: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { total: 0 };
  } catch {
    return { total: 0 };
  }
}

function saveStats(s: StoredStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

const RARE_GOLDEN: WakppuVariant = {
  id: "rare-golden",
  name: "황금 왁뿌 ✨",
  shell: { kind: "solid", outerColor: "#ffd35a", innerColor: "#fff7cc" },
  toneHint: "medium",
  accent: "#ffe27a",
};

export default function WakppuStage() {
  const [variant, setVariant] = useState<WakppuVariant>(VARIANTS[0]);
  const [stage, setStage] = useState<CrackStage>(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [shake, setShake] = useState<"none" | "soft" | "strong">("none");
  const [titleVisible, setTitleVisible] = useState(true);
  const [rareActive, setRareActive] = useState(false);

  const handleRef = useRef<WakppuCanvasHandle | null>(null);
  const lastBreakAtRef = useRef(0);
  const draggingRef = useRef(false);
  const pressRafRef = useRef(0);
  const lastTickRef = useRef(0);
  const variantRef = useRef(variant);
  variantRef.current = variant;
  const stageRef = useRef<CrackStage>(stage);
  stageRef.current = stage;

  useEffect(() => {
    const s = loadStats();
    setTotal(s.total);
    // 페이지 진입 즉시 자산 체크 + sustained.mp3 디코드를 백그라운드로
    // 트리거. 첫 누름까지 디코드 끝나 있을 가능성을 높임.
    ensureAudio();
  }, []);

  const handleStageChange = useCallback((s: CrackStage) => {
    setStage(s);
  }, []);

  const handleBreak = useCallback(() => {
    setTotal((prev) => {
      const next = prev + 1;
      saveStats({ total: next });
      return next;
    });
    const now = performance.now();
    if (now - lastBreakAtRef.current < STREAK_WINDOW_MS) {
      setStreak((s) => s + 1);
    } else {
      setStreak(1);
    }
    lastBreakAtRef.current = now;
    setShake("strong");
    setTimeout(() => setShake("none"), 420);
    stopCrackle();
    playJingle();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([12, 30, 60]);
    }
  }, []);

  // 짓누름 루프 — pointerdown 시작 후 rAF 로 dt 단위 진행
  const stopPressLoop = useCallback(() => {
    if (pressRafRef.current) {
      cancelAnimationFrame(pressRafRef.current);
      pressRafRef.current = 0;
    }
    stopCrackle();
    handleRef.current?.pressStop();
  }, []);

  const startPressLoop = useCallback(() => {
    lastTickRef.current = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - lastTickRef.current, 50);
      lastTickRef.current = now;
      const handle = handleRef.current;
      if (!handle) return;
      const result = handle.pressTick(dt);
      if (result.advancedTo !== null) {
        // 단계 진행 임팩트 — 짧은 흔들림 + 추가 micro-pop
        setShake("soft");
        setTimeout(() => setShake("none"), 200);
        playMicroPop(result.advancedTo, variantRef.current.toneHint, 1.1);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(12);
        }
        // 사운드 강도/단계 업데이트
        if (result.advancedTo < 5) {
          startCrackle(result.advancedTo, variantRef.current.toneHint);
        }
      }
      if (handle.getStage() >= 5) {
        stopPressLoop();
        return;
      }
      pressRafRef.current = requestAnimationFrame(step);
    };
    pressRafRef.current = requestAnimationFrame(step);
  }, [stopPressLoop]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      ensureAudio();
      const target = e.currentTarget as HTMLDivElement;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const handle = handleRef.current;
      if (!handle) return;
      if (!handle.isHit(x, y)) return;

      const curStage = handle.getStage();
      if (curStage >= 5) {
        // 완파 후 — 슬라임만 드래그로 늘이기
        draggingRef.current = true;
        return;
      }

      // 짓누르기 시작
      target.setPointerCapture?.(e.pointerId);
      handle.pressStart(x, y);
      // 첫 단계로 진입 — sustained 톤 시작 (toneHint, stage 0+1=1)
      const startStage = Math.max(1, curStage + 1) as CrackStage;
      startCrackle(startStage, variantRef.current.toneHint);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }
      startPressLoop();
      if (titleVisible) setTitleVisible(false);
    },
    [titleVisible, startPressLoop],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const handle = handleRef.current;
    if (!handle) return;
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const local = handle.toLocal(x, y);
    handle.setDrag(local.x, local.y);
  }, []);

  const onPointerEnd = useCallback(() => {
    if (draggingRef.current) {
      draggingRef.current = false;
      handleRef.current?.releaseDrag();
    }
    stopPressLoop();
  }, [stopPressLoop]);

  const onSelectVariant = useCallback((v: WakppuVariant) => {
    setVariant(v);
    setRareActive(false);
    // variant 교체는 애니메이션 없이 즉시 깔끔하게 리셋
    handleRef.current?.reset();
    setTitleVisible(true);
    stopPressLoop();
  }, [stopPressLoop]);

  const onRebuild = useCallback(() => {
    handleRef.current?.rebuild();
    playReassemble();
    if (total > 0 && total % 100 === 0 && !rareActive) {
      setRareActive(true);
      setVariant(RARE_GOLDEN);
    } else if (rareActive) {
      setRareActive(false);
      setVariant(VARIANTS[0]);
    }
    setTitleVisible(true);
  }, [total, rareActive]);

  const onApplyCustom = useCallback((v: WakppuVariant) => {
    setVariant(v);
    handleRef.current?.reset();
    setTitleVisible(true);
  }, []);

  useEffect(() => {
    return () => stopPressLoop();
  }, [stopPressLoop]);

  const shakeClass =
    shake === "strong" ? "stage-shake-strong" : shake === "soft" ? "stage-shake" : "";

  return (
    <main
      className="relative w-full overflow-hidden select-none"
      style={{ height: "100dvh" }}
    >
      <div className="stage-light" />

      <div className="absolute top-6 sm:top-10 left-1/2 -translate-x-1/2 z-10 text-center px-6 pointer-events-none">
        <h1
          className="fade-up text-[15px] sm:text-[16px] tracking-[0.42em] font-medium text-white/85"
          style={{ animationDelay: "0.05s" }}
        >
          WAKPPU
        </h1>
        <p
          className={`fade-up mt-1.5 text-[11px] sm:text-[12px] text-white/35 tracking-[0.06em] transition-opacity duration-500 ${
            titleVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ animationDelay: "0.18s" }}
        >
          {rareActive ? "💛 황금 왁뿌가 등장했어요" : "꾹 눌러서 부숴보세요"}
        </p>
      </div>

      <div
        className={`absolute inset-0 z-10 ${shakeClass}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
        style={{ touchAction: "none", cursor: stage < 5 ? "pointer" : "grab" }}
      >
        <WakppuCanvas
          variant={variant}
          onStageChange={handleStageChange}
          onBreak={handleBreak}
          handleRef={handleRef}
        />
      </div>

      <Stats total={total} streak={streak} />

      <RebuildButton
        visible={stage === 5}
        onClick={onRebuild}
        rare={rareActive}
      />

      <div className="absolute left-1/2 -translate-x-1/2 bottom-7 sm:bottom-10 z-20 fade-up">
        <VariantPicker
          current={variant}
          onSelect={onSelectVariant}
          onOpenCustom={() => setShowCustom(true)}
        />
      </div>

      <CustomMaker
        visible={showCustom}
        onClose={() => setShowCustom(false)}
        onApply={onApplyCustom}
      />
    </main>
  );
}
