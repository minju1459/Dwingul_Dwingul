import type { Letter, LetterRepository } from "./types";

type SampleLetter = Omit<Letter, "chainNumber">;

const SAMPLE_LETTERS: SampleLetter[] = [
  {
    id: "sample-001",
    body: `오늘 진짜 개힘든 하루엿ㄷr…
실수도 개마니하구… 마음도 찢어졋ㄷr…
화장실에서 몰래 눈물뚝뚝햇는데
집와서 결국 펑펑 울엇ㄷr…☆

근데 울고잇는 내모습 보니까
또 그런 내가 싫어졋ㄷr…
왜케 바보같은지 몰겟ㄷr 정말루…

지금은 Y 들으면서
감성에 젖어잇ㄷr…
2005 감성 ON…★
오늘만큼은 그냥 슬퍼해볼ㄹH… ∘₊✧────✧₊∘`,
    createdAt: new Date("2026-05-18T22:14:00"),
  },
  {
    id: "sample-002",
    body: `새벽 3시 22분…☆
다들 자는데 나만 깨어잇ㄷr…

오늘 친구한테 톡 보냇는데
읽씹당햇ㄷr…
별것도 아닌ㄷH 왜 이렇게 신경쓰이ㅈl…

이런 내가 좀 피곤햇으면 좋겟ㄷr
근ㄷH 어쩔 수 없는 ㄱr ㄱr튼ㄷr…

자고 일어나면 괜찮아ㅈl겟ㅈl…?
오늘 밤만 좀 약해질ㄹH… ★━♡━★`,
    createdAt: new Date("2026-05-18T03:42:00"),
  },
  {
    id: "sample-003",
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
