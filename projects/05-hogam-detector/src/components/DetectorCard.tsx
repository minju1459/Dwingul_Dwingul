"use client";

import { useState } from "react";
import type { DetectResponse, DetectResult } from "@/lib/types";
import { LoadingState } from "./LoadingState";
import { ResultCard } from "./ResultCard";

const MAX_LEN = 240;
const PLACEHOLDER = "ex) 걔가 오늘 나보고 웃었음";

export function DetectorCard() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSubmitted(value);

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: value }),
      });
      const data = (await res.json()) as DetectResponse;
      if (!data.ok) {
        throw new Error(data.error);
      }
      setResult(data.data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "알 수 없는 에러. 잠시 후 다시.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setText("");
    setSubmitted("");
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6">
        <LoadingState />
      </div>
    );
  }

  if (result) {
    return (
      <ResultCard
        situation={submitted}
        result={result}
        onReset={handleReset}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-12px_rgba(0,0,0,0.6)] sm:p-6"
    >
      <label
        htmlFor="situation"
        className="text-[13px] font-semibold tracking-tight text-[var(--ink-soft)]"
      >
        그 사람이 오늘 너한테 한 행동
      </label>
      <textarea
        id="situation"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
        placeholder={PLACEHOLDER}
        rows={4}
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] px-3.5 py-3 text-[16px] leading-relaxed text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-soft)]/60 focus:border-[var(--ink-soft)]"
      />
      <div className="flex items-center justify-between text-[12px] text-[var(--ink-soft)]">
        <span>최대 {MAX_LEN}자</span>
        <span className="font-mono tabular-nums">
          {text.length}/{MAX_LEN}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-[13px] text-[var(--accent)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!text.trim()}
        className="rounded-xl bg-[var(--ink)] px-4 py-3.5 text-[15px] font-semibold text-[var(--bg)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        판독하기
      </button>
    </form>
  );
}
