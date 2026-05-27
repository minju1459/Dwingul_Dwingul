"use client";

type Props = {
  visible: boolean;
};

// 타이틀 주변에 흩뿌릴 sparkle 위치 (% 단위, 절대 위치)
const SPARKLES: Array<{ top: string; left: string; size: number; delay: string }> = [
  { top: "-6%", left: "8%", size: 18, delay: "0s" },
  { top: "12%", left: "-4%", size: 12, delay: "0.4s" },
  { top: "-12%", left: "48%", size: 20, delay: "0.2s" },
  { top: "20%", left: "94%", size: 14, delay: "0.7s" },
  { top: "-4%", left: "88%", size: 16, delay: "0.5s" },
  { top: "85%", left: "12%", size: 12, delay: "0.9s" },
  { top: "92%", left: "78%", size: 14, delay: "0.3s" },
  { top: "60%", left: "-6%", size: 10, delay: "1.1s" },
  { top: "75%", left: "100%", size: 14, delay: "0.6s" },
];

export default function Celebration({ visible }: Props) {
  if (!visible) return null;
  return (
    <div className="absolute inset-x-0 top-[10%] sm:top-[14%] flex flex-col items-center pointer-events-none z-30 px-6 text-center">
      <div className="relative inline-block">
        <span className="title-spotlight" />
        <h1
          className="title-rise shimmer-text font-semibold tracking-tight leading-[1.02]"
          style={{
            fontSize: "clamp(48px, 11vw, 112px)",
          }}
        >
          Happy Birthday
        </h1>
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="sparkle"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
