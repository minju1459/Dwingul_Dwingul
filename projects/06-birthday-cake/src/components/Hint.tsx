"use client";

import type { MicState } from "@/lib/useClapDetection";

type Props = {
  phase: "intro" | "listening" | "celebrating";
  litCount: number;
  totalCandles: number;
  micState: MicState;
  onStartListening: () => void;
};

export default function Hint({
  phase,
  litCount,
  totalCandles,
  micState,
  onStartListening,
}: Props) {
  if (phase === "celebrating") return null;

  if (phase === "intro") {
    return (
      <div className="absolute inset-x-0 bottom-10 sm:bottom-14 flex flex-col items-center px-6 z-20">
        <p className="text-[15px] sm:text-base text-[var(--ink-soft)] mb-4 text-center fade-up">
          박수를 치면 촛불이 하나씩 꺼져요
        </p>
        <button
          onClick={onStartListening}
          className="px-7 py-3 rounded-full bg-white text-black text-[15px] font-medium tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-transform fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          시작하기
        </button>
      </div>
    );
  }

  // listening
  const blownCount = totalCandles - litCount;
  const micLabel: Record<MicState, string> = {
    idle: "",
    requesting: "마이크 권한을 확인하는 중…",
    listening: "👏 박수를 쳐 보세요",
    denied: "마이크 권한이 없어요. 화면을 탭하면 박수로 인정돼요",
    unsupported: "이 브라우저는 마이크를 못 써요. 화면을 탭해 주세요",
  };

  return (
    <div className="absolute inset-x-0 bottom-10 sm:bottom-14 flex flex-col items-center px-6 z-20 pointer-events-none">
      <p className="text-[15px] sm:text-base text-[var(--ink-soft)] text-center pulse-soft">
        {micLabel[micState] || "잠깐만요…"}
      </p>
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: totalCandles }).map((_, i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              background:
                i < blownCount ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
