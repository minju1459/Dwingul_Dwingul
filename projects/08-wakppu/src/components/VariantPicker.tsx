"use client";

import { VARIANTS } from "@/lib/wakppu/variants";
import type { WakppuVariant } from "@/lib/wakppu/types";

type Props = {
  current: WakppuVariant;
  onSelect: (v: WakppuVariant) => void;
  onOpenCustom: () => void;
};

export default function VariantPicker({ current, onSelect, onOpenCustom }: Props) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {VARIANTS.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v)}
          className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-transform active:scale-95"
          aria-label={v.name}
        >
          <ThumbSwatch variant={v} selected={current.id === v.id} />
          <span
            className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px] whitespace-nowrap transition-opacity ${
              current.id === v.id ? "text-white/90 opacity-100" : "text-white/45 opacity-0 group-hover:opacity-100"
            }`}
          >
            {v.name}
          </span>
        </button>
      ))}

      <div className="w-px h-8 bg-white/10 mx-1 sm:mx-2" />

      <button
        onClick={onOpenCustom}
        className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-transform active:scale-95 ${
          current.id === "custom" ? "ring-2 ring-white/80" : "ring-1 ring-white/15 hover:ring-white/35"
        }`}
        style={{
          background:
            "conic-gradient(from 200deg, #ff6fa5, #ffd76b, #7dd3fc, #86efac, #c4b5fd, #ff6fa5)",
        }}
        aria-label="직접 만들기"
      >
        <span className="absolute inset-[3px] rounded-full bg-black/55 flex items-center justify-center text-[10px] sm:text-[11px] tracking-tight">
          + 만들기
        </span>
      </button>
    </div>
  );
}

function ThumbSwatch({ variant, selected }: { variant: WakppuVariant; selected: boolean }) {
  const ring = selected ? "ring-2 ring-white/85" : "ring-1 ring-white/15 group-hover:ring-white/40";
  if (variant.shell.kind === "donut") {
    return (
      <div
        className={`w-full h-full rounded-full ${ring} transition-shadow`}
        style={{
          background: `conic-gradient(from 180deg, ${variant.shell.innerColors.join(", ")}, ${variant.shell.innerColors[0]})`,
          position: "relative",
        }}
      >
        <span
          className="absolute inset-[10%] rounded-full"
          style={{ background: variant.shell.glaze, opacity: 0.85 }}
        />
        <span
          className="absolute inset-[38%] rounded-full"
          style={{ background: "#000" }}
        />
      </div>
    );
  }
  return (
    <div
      className={`w-full h-full rounded-full ${ring} transition-shadow`}
      style={{
        background: `radial-gradient(circle at 35% 30%, #ffffffaa, transparent 35%), radial-gradient(circle at 50% 50%, ${variant.shell.outerColor} 0%, ${variant.shell.outerColor} 60%, ${darken(variant.shell.outerColor, 0.25)} 100%)`,
      }}
    />
  );
}

function darken(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  const f = (c: number) => Math.round(c * (1 - amount));
  const hx = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hx(f(r))}${hx(f(g))}${hx(f(b))}`;
}
