"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { makeCustomVariant } from "@/lib/wakppu/variants";
import type { WakppuVariant } from "@/lib/wakppu/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (v: WakppuVariant) => void;
};

const OUTER_PRESETS = [
  "#ffffff", "#ff8fb3", "#ffd76b", "#a8e063", "#7dd3fc",
  "#c4b5fd", "#3b2418", "#f9a8d4", "#fda4af", "#fde68a",
];
const INNER_PRESETS = [
  "#ffffff", "#ffeaf5", "#fff4cc", "#d1fadf", "#cfe9ff",
  "#e9defc", "#8be8c8", "#ffc4dd", "#ffd6e5", "#fff7c8",
];

const TONES: Array<{ id: "light" | "medium" | "heavy"; label: string }> = [
  { id: "light", label: "가벼움" },
  { id: "medium", label: "단단함" },
  { id: "heavy", label: "묵직함" },
];

export default function CustomMaker({ visible, onClose, onApply }: Props) {
  const [shape, setShape] = useState<"solid" | "donut">("solid");
  const [outerColor, setOuterColor] = useState("#a8e063");
  const [innerColor, setInnerColor] = useState("#ffffff");
  const [tone, setTone] = useState<"light" | "medium" | "heavy">("medium");

  function handleApply() {
    onApply(makeCustomVariant({ shape, outerColor, innerColor, tone }));
    onClose();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold tracking-tight">내 왁뿌 만들기</h2>
              <button
                onClick={onClose}
                className="text-[12px] text-white/45 hover:text-white/85"
              >
                닫기
              </button>
            </div>

            {/* 미리보기 */}
            <div className="flex justify-center mb-5">
              <Preview shape={shape} outerColor={outerColor} innerColor={innerColor} />
            </div>

            {/* 모양 */}
            <Section title="모양">
              <div className="flex gap-2">
                <ChipButton selected={shape === "solid"} onClick={() => setShape("solid")}>
                  통 왁스
                </ChipButton>
                <ChipButton selected={shape === "donut"} onClick={() => setShape("donut")}>
                  도넛형
                </ChipButton>
              </div>
            </Section>

            {/* 겉 색상 */}
            <Section title="겉 색깔">
              <ColorRow
                value={outerColor}
                onChange={setOuterColor}
                presets={OUTER_PRESETS}
              />
            </Section>

            {/* 속 색상 */}
            <Section title="속 슬라임 색깔">
              <ColorRow
                value={innerColor}
                onChange={setInnerColor}
                presets={INNER_PRESETS}
              />
            </Section>

            {/* 음색 */}
            <Section title="부서지는 소리">
              <div className="flex gap-2">
                {TONES.map((t) => (
                  <ChipButton key={t.id} selected={tone === t.id} onClick={() => setTone(t.id)}>
                    {t.label}
                  </ChipButton>
                ))}
              </div>
            </Section>

            <button
              onClick={handleApply}
              className="mt-2 w-full py-3.5 rounded-2xl bg-white text-black text-[14px] font-medium tracking-tight active:scale-[0.98] transition-transform"
            >
              내 왁뿌로 시작하기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-2">{title}</div>
      {children}
    </div>
  );
}

function ChipButton({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-[12.5px] transition ${
        selected
          ? "bg-white text-black"
          : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function ColorRow({
  value,
  onChange,
  presets,
}: {
  value: string;
  onChange: (c: string) => void;
  presets: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          aria-label={c}
          className={`w-8 h-8 rounded-full transition ${
            value === c ? "ring-2 ring-white scale-110" : "ring-1 ring-white/15 hover:scale-105"
          }`}
          style={{ background: c }}
        />
      ))}
      <label className="ml-1 relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/20 hover:ring-white/40 cursor-pointer">
        <span
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(#ff5e7a, #ffd76b, #86efac, #7dd3fc, #c4b5fd, #ff5e7a)",
          }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );
}

function Preview({
  shape,
  outerColor,
  innerColor,
}: {
  shape: "solid" | "donut";
  outerColor: string;
  innerColor: string;
}) {
  if (shape === "donut") {
    return (
      <div
        className="relative w-24 h-24 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, #000 0%, #000 28%, ${outerColor} 30%, ${outerColor} 100%)`,
        }}
      >
        <span
          className="absolute inset-[14%] rounded-full"
          style={{ background: innerColor, opacity: 0.55 }}
        />
        <span
          className="absolute inset-[36%] rounded-full"
          style={{ background: "#000" }}
        />
      </div>
    );
  }
  return (
    <div
      className="w-24 h-24 rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, #ffffff99, transparent 35%), radial-gradient(circle at 50% 50%, ${outerColor} 0%, ${outerColor} 65%, #00000044 100%)`,
        boxShadow: `inset 0 -10px 20px rgba(0,0,0,0.3)`,
      }}
    >
      <span className="block w-full h-full rounded-full opacity-0" style={{ background: innerColor }} />
    </div>
  );
}
