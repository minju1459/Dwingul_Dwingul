import type { WakppuVariant, WakppuShell } from "./types";

export const VARIANTS: WakppuVariant[] = [
  {
    id: "donut",
    name: "무지개 도넛",
    shell: {
      kind: "donut",
      // 사용자 설명: 도넛은 안쪽이 하늘색/노란색/핑크 그라데이션, 바깥은 하얀 막.
      // 부서질 때 강하게 보이도록 파스텔보다 진한 톤으로.
      innerColors: ["#ff7eb5", "#ffd76b", "#7dd3fc", "#c4b5fd"],
      glaze: "#ffffff",
      sprinkles: ["#ff6fa5", "#ffd76b", "#7dd3fc", "#86efac", "#c4b5fd", "#fff066"],
    },
    toneHint: "light",
    accent: "#ff8fb3",
  },
  {
    id: "greenApple",
    name: "청사과",
    shell: {
      kind: "solid",
      // 사용자 설명: 청사과는 겉에 연두, 안에 흰색
      outerColor: "#a8e063",
      innerColor: "#ffffff",
    },
    toneHint: "medium",
    accent: "#b6ec78",
  },
  {
    id: "chocomint",
    name: "초코민트",
    shell: {
      kind: "solid",
      // 사용자 설명: 초코민트는 겉에 초코, 안에 민트
      outerColor: "#3b2418",
      innerColor: "#8be8c8",
    },
    toneHint: "heavy",
    accent: "#7fdcb5",
  },
];

export const DEFAULT_VARIANT_ID = "donut";

export function findVariant(id: string): WakppuVariant {
  return VARIANTS.find((v) => v.id === id) ?? VARIANTS[0];
}

/**
 * 커스텀 메이커에서 만들어진 1회용 variant.
 */
export function makeCustomVariant(opts: {
  shape: "solid" | "donut";
  outerColor: string;
  innerColor: string;
  tone: "light" | "medium" | "heavy";
}): WakppuVariant {
  const shell: WakppuShell =
    opts.shape === "donut"
      ? {
          kind: "donut",
          innerColors: [opts.innerColor, lighten(opts.innerColor, 0.15), opts.innerColor],
          glaze: opts.outerColor,
          sprinkles: ["#ff6fa5", "#ffd76b", "#7dd3fc", "#86efac"],
        }
      : { kind: "solid", outerColor: opts.outerColor, innerColor: opts.innerColor };
  return {
    id: "custom",
    name: "내 왁뿌",
    shell,
    toneHint: opts.tone,
    accent: opts.outerColor,
  };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const f = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return rgbToHex(f(r), f(g), f(b));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const v = h.length === 3
    ? h.split("").map((c) => c + c).join("")
    : h;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function withAlpha(hex: string, a: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
