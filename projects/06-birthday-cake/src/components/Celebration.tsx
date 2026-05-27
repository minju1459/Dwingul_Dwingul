"use client";

type Props = {
  visible: boolean;
};

export default function Celebration({ visible }: Props) {
  if (!visible) return null;
  return (
    <div className="absolute inset-x-0 top-[14%] sm:top-[18%] flex flex-col items-center pointer-events-none z-30 px-6 text-center">
      <h1
        className="title-rise text-[40px] sm:text-[64px] font-semibold tracking-tight leading-[1.05] text-white"
        style={{ textShadow: "0 4px 28px rgba(255, 200, 120, 0.35)" }}
      >
        Happy Birthday
      </h1>
      <p
        className="fade-up mt-3 text-[14px] sm:text-base text-[var(--ink-soft)]"
        style={{ animationDelay: "0.7s" }}
      >
        오늘 하루 빛나길 바라요 🤍
      </p>
    </div>
  );
}
