"use client";

import { useEffect, useState } from "react";
import type { DetectResult } from "@/lib/types";
import { Meter } from "./Meter";

type Props = {
  situation: string;
  result: DetectResult;
  onReset: () => void;
};

const VERDICT_LABEL: Record<DetectResult["verdict"], string> = {
  호감_아님: "호감 아님",
  애매: "애매함",
  어쩌면_호감: "어쩌면 호감",
};

const VERDICT_TONE: Record<DetectResult["verdict"], string> = {
  호감_아님:
    "bg-[var(--accent-soft)] text-[var(--accent)] border-[color:var(--accent)]/30",
  애매: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  어쩌면_호감: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

function buildShareText(
  situation: string,
  result: DetectResult,
  url: string,
) {
  const meters = `희망회로 ${result.hopeMeter}% / 현실가능성 ${result.realityMeter}%`;
  const lines = [
    "🧊 LoveSignal",
    `상황: ${situation}`,
    "",
    result.headline,
    ...result.lines,
    "",
    meters,
  ];
  if (url) {
    lines.push("", `👉 ${url}`);
  }
  return lines.join("\n");
}

export function ResultCard({ situation, result, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  // SSR 단계에선 window 없음. mount 후 한 번만 origin 확보.
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.origin);
  }, []);

  const shareText = buildShareText(situation, result, pageUrl);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({
          title: "LoveSignal",
          text: shareText,
          url: pageUrl || undefined,
        });
        return;
      } catch {
        // 사용자가 취소했을 때는 메시지 안 띄움.
        return;
      }
    }
    // share API 없으면 클립보드로 대체.
    await handleCopy();
    setShareMsg("공유 API 없어서 그냥 복사함");
    setTimeout(() => setShareMsg(null), 1800);
  }

  return (
    <div className="animate-pop-in flex flex-col gap-6 rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-12px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold tracking-tight ${VERDICT_TONE[result.verdict]}`}
        >
          {VERDICT_LABEL[result.verdict]}
        </span>
      </div>

      <div>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-[var(--ink)]">
          {result.headline}
        </h2>
        <ul className="mt-3 flex flex-col gap-1.5">
          {result.lines.map((line, idx) => (
            <li
              key={idx}
              className="text-[15px] leading-relaxed text-[var(--ink)]"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Meter label="희망회로" value={result.hopeMeter} tone="hope" />
        <Meter label="현실 가능성" value={result.realityMeter} tone="reality" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 rounded-xl bg-[var(--ink)] px-4 py-3 text-[14px] font-semibold text-[var(--bg)] transition-transform active:scale-[0.98]"
        >
          공유하기
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--ink)] transition-transform active:scale-[0.98]"
        >
          {copied ? "복사됨!" : "결과 복사"}
        </button>
      </div>

      {shareMsg && (
        <p className="-mt-2 text-center text-[12px] text-[var(--ink-soft)]">
          {shareMsg}
        </p>
      )}

      <button
        type="button"
        onClick={onReset}
        className="-mt-2 text-center text-[13px] font-medium text-[var(--ink-soft)] underline-offset-2 hover:underline"
      >
        다른 상황도 적어봐
      </button>
    </div>
  );
}
