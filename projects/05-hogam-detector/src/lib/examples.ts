import type { DetectResult } from "./types";

export const LOADING_PHRASES = [
  "행복회로 제거 중…",
  "상대방 행동 억지로 의미부여하는 중…",
  "AI가 최대한 차갑게 분석 중…",
  "김칫국 농도 측정 중…",
  "친구 의견 시뮬레이션 중…",
  "팩폭 데이터셋 로딩 중…",
  "썸 가능성 0.0001%까지 계산 중…",
  "착각 필터 가동 중…",
  "혼자 설레는 거 아닌지 검사 중…",
  "연애세포 사망신고 처리 중…",
];

export const PLACEHOLDER_EXAMPLES = [
  "얘가 오늘 입에 뭐 묻은 거 떼줬어",
  "맨날 내 스토리 봐",
  "카톡 답장이 늘 1시간 뒤에 옴",
  "단톡에서만 말 걸고 dm은 안 옴",
  "내 생일을 기억하고 있었어",
  "둘이 있을 때만 좀 조용해짐",
];

// API 키가 없을 때 fallback. 입력을 받아 살짝 다른 결과를 섞어 돌려줌.
const MOCK_RESULTS: DetectResult[] = [
  {
    verdict: "호감_아님",
    headline: "호감 아님.",
    lines: [
      "그냥 위생 관리해준 거임.",
      "친구한테도 똑같이 함.",
      "착각 ㄴㄴ.",
    ],
    hopeMeter: 14,
    realityMeter: 8,
    coldness: "AI 냉정도: 연애 세포 소멸 상태",
  },
  {
    verdict: "호감_아님",
    headline: "그건 걍 잘나와서 그런거임.",
    lines: [
      "스토리 본다고 다 좋아요 누르는거 아님.",
      "걔는 다른 사람 스토리도 좋아요 누름.",
      "좋아요 테러범임.",
      "근데 또 사람 일은 모르는 거긴 함.",
    ],
    hopeMeter: 22,
    realityMeter: 11,
    coldness: "AI 냉정도: 친구로 확정 짓는 중",
  },
  {
    verdict: "애매",
    headline: "애매.",
    lines: [
      "데이터 부족.",
      "걔가 모두한테 친절한 타입인지부터 보셈.",
      "혼자 의미부여 금지.",
    ],
    hopeMeter: 41,
    realityMeter: 27,
    coldness: "AI 냉정도: 살짝 식은 아메리카노",
  },
  {
    verdict: "애매",
    headline: "썸 같긴 한데.",
    lines: [
      "근데 너만 그렇게 느낄 확률 높음.",
      "직접 물어보는 게 빠름.",
      "괜히 시간 낭비 ㄴㄴ.",
    ],
    hopeMeter: 49,
    realityMeter: 30,
    coldness: "AI 냉정도: 미온수",
  },
  {
    verdict: "어쩌면_호감",
    headline: "어쩌면.",
    lines: [
      "이번 건 좀 의외임.",
      "근데 한 번 가지고 결론 내지 마라.",
      "다음에도 그러면 그때 설레라.",
    ],
    hopeMeter: 63,
    realityMeter: 38,
    coldness: "AI 냉정도: 살짝 데워진 정도",
  },
];

export function pickMock(seed: string): DetectResult {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % MOCK_RESULTS.length;
  return MOCK_RESULTS[idx];
}
