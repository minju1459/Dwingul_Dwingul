type MeterProps = {
  label: string;
  value: number;
  tone: "hope" | "reality";
};

export function Meter({ label, value, tone }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const color =
    tone === "hope" ? "bg-[var(--accent)]" : "bg-[var(--cool)]";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-medium text-[var(--ink-soft)]">{label}</span>
        <span className="font-mono text-[14px] font-semibold text-[var(--ink)] tabular-nums">
          {clamped}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-soft)]">
        <div
          className={`bar-fill h-full rounded-full ${color}`}
          style={{ ["--w" as string]: `${clamped}%`, width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
