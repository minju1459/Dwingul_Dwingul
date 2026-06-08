"use client";

type Props = {
  total: number;
  streak: number;
};

export default function Stats({ total, streak }: Props) {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 text-right pointer-events-none">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">파괴</div>
      <div className="text-[18px] sm:text-[20px] font-semibold tracking-tight tabular-nums">
        {total.toLocaleString()}
      </div>
      {streak > 1 && (
        <div className="mt-1 text-[10.5px] text-white/55 tabular-nums">
          연속 × {streak}
        </div>
      )}
    </div>
  );
}
