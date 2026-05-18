import type { Letter, LetterRepository } from "./types";

type SampleLetter = Omit<Letter, "chainNumber">;

const SAMPLE_LETTERS: SampleLetter[] = [
  {
    id: "sample-001",
    body: `오늘 ㅇl상하게 너 생각이 났ㄷr…
다 잊은 줄 알앗는데…

길 가다가 너랑 같은 향수 향기 ㅁr앗ㄷr…
순간 ㅅl간이 멈춘 줄 알앗엇ㄷr…
근ㄷH 너가 ㅇr니엿ㄷr…

ㅂr보같ㅈl…?
다 잊은 척 햇는데
ㅇr직도 마음 한구석엔 너 잇엇네…

ㅇl 편지 받은 너도
잊고 싶은 누군가 잇으ㄴl…
∘₊✧────✧₊∘`,
    createdAt: new Date("2026-05-17T19:08:00"),
  },
];

/** 체인 위치를 흉내내는 가짜 카운터.
 * 실제 백엔드 붙으면 DB의 진짜 순번으로 교체. */
function makeFakeChainNumber(): number {
  return Math.floor(Math.random() * 1700) + 800;
}

export function pickRandomLetter(): Letter {
  const idx = Math.floor(Math.random() * SAMPLE_LETTERS.length);
  return {
    ...SAMPLE_LETTERS[idx],
    chainNumber: makeFakeChainNumber(),
  };
}

let cursor = 0;

export const mockRepository: LetterRepository = {
  async getPreviousLetter() {
    const sample = SAMPLE_LETTERS[cursor % SAMPLE_LETTERS.length];
    cursor += 1;
    return {
      ...sample,
      chainNumber: makeFakeChainNumber(),
    };
  },

  async sendLetter(body: string) {
    const id = `mock-${Date.now()}`;
    if (process.env.NODE_ENV !== "production") {
      console.log("[mock] letter sent:", { id, length: body.length });
    }
    return { id };
  },
};
