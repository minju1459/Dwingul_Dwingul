export type Verdict = "호감_아님" | "애매" | "어쩌면_호감";

export type DetectResult = {
  verdict: Verdict;
  headline: string;
  lines: string[];
  hopeMeter: number;
  realityMeter: number;
  coldness: string;
};

export type DetectResponse =
  | { ok: true; data: DetectResult; source: "openai" | "mock" }
  | { ok: false; error: string };
