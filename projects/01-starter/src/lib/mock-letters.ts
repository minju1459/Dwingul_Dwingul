import type { Letter, LetterRepository } from "./types";

const SAMPLE_LETTERS: Letter[] = [
  {
    id: "sample-001",
    body: `안녕하세요, 모르는 사람.

오늘은 비가 왔어요. 창문을 열어두고 한참을 멍하니 빗소리를 들었어요.
요즘 자주 외롭다는 생각을 해요. 그런데 이 편지를 쓰니까 조금 덜 외로워지는 것 같아요.

당신이 이 편지를 읽고 있다면, 당신도 무언가를 견디고 있는 사람일 거예요.
잘 견뎌요, 우리.

— 누군가로부터`,
    createdAt: new Date("2026-05-18T22:14:00"),
  },
  {
    id: "sample-002",
    body: `오늘 처음으로 모르는 사람한테 편지를 써요.

기분이 이상하네요. 누구한테 보낼지도 모르고, 누가 읽을지도 모르는데.
그래서 더 솔직해질 수 있는 것 같기도 해요.

요즘 자기 전에 천장을 한참 봐요. 별일 없는데 잠이 안 와요.
이 편지가 누군가에게 닿길 바라며.`,
    createdAt: new Date("2026-05-18T03:42:00"),
  },
  {
    id: "sample-003",
    body: `안녕, 낯선 사람.

작년에 키우던 고양이가 무지개 다리를 건넜어요.
오늘 그 아이 사진을 오랜만에 봤는데, 이상하게 마음이 따뜻해졌어요.
처음엔 보기만 해도 울었는데, 이제는 미소가 나요.

시간이 정말 무섭게 사람을 낫게 하네요.
당신도 무엇이든 그렇게 지나갈 거예요.`,
    createdAt: new Date("2026-05-17T19:08:00"),
  },
];

let cursor = 0;

export const mockRepository: LetterRepository = {
  async getPreviousLetter() {
    const letter = SAMPLE_LETTERS[cursor % SAMPLE_LETTERS.length];
    cursor += 1;
    return letter;
  },

  async sendLetter(body: string) {
    const id = `mock-${Date.now()}`;
    if (process.env.NODE_ENV !== "production") {
      console.log("[mock] letter sent:", { id, length: body.length });
    }
    return { id };
  },
};

export function pickRandomLetter(): Letter {
  const idx = Math.floor(Math.random() * SAMPLE_LETTERS.length);
  return SAMPLE_LETTERS[idx];
}
