import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { pickMock } from "@/lib/examples";
import type { DetectResponse, DetectResult, Verdict } from "@/lib/types";

export const runtime = "nodejs";

const MAX_INPUT_LEN = 300;
const VERDICTS: Verdict[] = ["호감_아님", "애매", "어쩌면_호감"];

function clamp(n: unknown, min: number, max: number, fallback: number) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, Math.round(v)));
}

function normalize(raw: unknown): DetectResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const verdict = VERDICTS.includes(r.verdict as Verdict)
    ? (r.verdict as Verdict)
    : "호감_아님";

  const headline =
    typeof r.headline === "string" && r.headline.trim().length
      ? r.headline.trim().slice(0, 40)
      : "호감 아님.";

  const linesRaw = Array.isArray(r.lines) ? r.lines : [];
  const lines = linesRaw
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim().slice(0, 80))
    .slice(0, 5);
  if (lines.length === 0) {
    lines.push("데이터 부족. 그냥 직접 물어봐.");
  }

  return {
    verdict,
    headline,
    lines,
    hopeMeter: clamp(r.hopeMeter, 0, 100, 70),
    realityMeter: clamp(r.realityMeter, 0, 100, 18),
    coldness:
      typeof r.coldness === "string" && r.coldness.trim().length
        ? r.coldness.trim().slice(0, 60)
        : "AI 냉정도: 미온수",
  };
}

function extractJson(text: string): unknown {
  // 코드펜스 들어있으면 벗기고, 그래도 안 되면 첫 { ~ 마지막 }까지 파싱.
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request: Request): Promise<NextResponse<DetectResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "본문 파싱 실패" },
      { status: 400 },
    );
  }

  const situation =
    typeof (body as { situation?: unknown })?.situation === "string"
      ? ((body as { situation: string }).situation || "").trim()
      : "";

  if (!situation) {
    return NextResponse.json(
      { ok: false, error: "상황을 입력해줘." },
      { status: 400 },
    );
  }
  if (situation.length > MAX_INPUT_LEN) {
    return NextResponse.json(
      { ok: false, error: `너무 길어. ${MAX_INPUT_LEN}자 이내로.` },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    // 키 없으면 mock으로 동작 — 로컬 개발용.
    return NextResponse.json({
      ok: true,
      source: "mock",
      data: pickMock(situation),
    });
  }

  try {
    // Gemini의 OpenAI 호환 엔드포인트 사용.
    // https://ai.google.dev/gemini-api/docs/openai
    const client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
    const completion = await client.chat.completions.create({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      temperature: 0.9,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(situation) },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    const result = normalize(parsed);

    if (!result) {
      console.warn("[detect] 응답 정규화 실패. raw content:", content);
      return NextResponse.json({
        ok: true,
        source: "mock",
        data: pickMock(situation),
      });
    }

    return NextResponse.json({ ok: true, source: "openai", data: result });
  } catch (err) {
    console.error("[detect] Gemini 호출 실패:", err);
    // 외부 API 실패해도 사용자한테는 mock으로라도 응답.
    return NextResponse.json({
      ok: true,
      source: "mock",
      data: pickMock(situation),
    });
  }
}
