"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WakppuCanvas, { type WakppuCanvasHandle } from "./WakppuCanvas";
import VariantPicker from "./VariantPicker";
import CustomMaker from "./CustomMaker";
import RebuildButton from "./RebuildButton";
import Stats from "./Stats";
import { VARIANTS, makeCustomVariant } from "@/lib/wakppu/variants";
import type { WakppuVariant, CrackStage } from "@/lib/wakppu/types";
import { ensureAudio, playCrack, playJingle, playReassemble } from "@/lib/wakppu/sound";

const STORAGE_KEY = "wakppu:stats:v1";
const STREAK_WINDOW_MS = 1400; // 마지막 부순 이후 이 시간 안에 또 부수면 streak ++

type StoredStats = {
  total: number;
};

function loadStats(): StoredStats {
  if (typeof window === "undefined") return { total: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { total: 0 };
    return JSON.parse(raw);
  } catch {
    return { total: 0 };
  }
}

function saveStats(s: StoredStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

// 황금 왁뿌 — 100번째 마다 1회 등장
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

  // 초기 로드
  useEffect(() => {
    const s = loadStats();
    setTotal(s.total);
  }, []);

  const handleStageChange = useCallback((s: CrackStage) => {
    setStage(s);
  }, []);

  const handleBreak = useCallback(() => {
    setTotal((prev) => {
      const next = prev + 1;
      saveStats({ total: next });
      // 100번째 = 직전이 99 → 다음 부숨이 100. 부순 직후 100번째라면 다음 라운드에 rare 등장.
      return next;
    });
    // streak
    const now = performance.now();
    if (now - lastBreakAtRef.current < STREAK_WINDOW_MS) {
      setStreak((s) => s + 1);
    } else {
      setStreak(1);
    }
    lastBreakAtRef.current = now;
    setShake("strong");
    setTimeout(() => setShake("none"), 420);
    playJingle();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  // 클릭/탭 처리
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      ensureAudio();
      const canvas = e.currentTarget as HTMLDivElement;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const handle = handleRef.current;
      if (!handle) return;
      if (!handle.isHit(x, y)) return;

      // 슬라임 노출 후엔 드래그로 늘이기, 아니면 부수기
      const curStage = handle.getStage();
      if (curStage >= 4 && curStage < 5) {
        draggingRef.current = true;
        return;
      }
      if (curStage === 5) {
        // 슬라임만 흔들기 (드래그)
        draggingRef.current = true;
        return;
      }

      // 한 번 부수기
      const next = handle.hitAt(x, y);
      playCrack(next, variant.toneHint);

      // 소프트 진동 + 화면 흔들림
      if (next < 5) {
        setShake("soft");
        setTimeout(() => setShake("none"), 220);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(12);
        }
      }
      if (titleVisible) setTitleVisible(false);
    },
    [variant, titleVisible],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const handle = handleRef.current;
    if (!handle) return;
    const canvas = e.currentTarget as HTMLDivElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const local = handle.toLocal(x, y);
    handle.setDrag(local.x, local.y);
  }, []);

  const onPointerEnd = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    handleRef.current?.releaseDrag();
  }, []);

  const onSelectVariant = useCallback((v: WakppuVariant) => {
    setVariant(v);
    setRareActive(false);
    handleRef.current?.rebuild();
    setTitleVisible(true);
  }, []);

  const onRebuild = useCallback(() => {
    handleRef.current?.rebuild();
    playReassemble();
    // 100번째 직후 다음 사이클이면 rare 등장
    if (total > 0 && total % 100 === 0 && !rareActive) {
      setRareActive(true);
      setVariant(RARE_GOLDEN);
    } else if (rareActive) {
      // rare 한 번 부순 뒤 원래 variant 로 복귀(이미 등록되어 있던 선택 유지 못 하므로 도넛으로)
      setRareActive(false);
      setVariant(VARIANTS[0]);
    }
    setTitleVisible(true);
  }, [total, rareActive]);

  const onApplyCustom = useCallback((v: WakppuVariant) => {
    setVariant(v);
    handleRef.current?.rebuild();
    setTitleVisible(true);
  }, []);

  const shakeClass =
    shake === "strong" ? "stage-shake-strong" : shake === "soft" ? "stage-shake" : "";

  return (
    <main
      className="relative w-full overflow-hidden select-none"
      style={{ height: "100dvh" }}
    >
      <div className="stage-light" />

      {/* 상단 타이틀 */}
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
          {rareActive ? "💛 황금 왁뿌가 등장했어요" : "눌러서 부숴보세요"}
        </p>
      </div>

      {/* 스테이지: 캔버스 + 인터랙션 영역 */}
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

      {/* 하단 픽커 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-7 sm:bottom-10 z-20 fade-up">
        <VariantPicker
          current={variant}
          onSelect={onSelectVariant}
          onOpenCustom={() => setShowCustom(true)}
        />
      </div>

      {/* 커스텀 메이커 모달 */}
      <CustomMaker
        visible={showCustom}
        onClose={() => setShowCustom(false)}
        onApply={onApplyCustom}
      />
    </main>
  );
}
