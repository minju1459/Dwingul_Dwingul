# 호감판독기

> 걔 행동 적으면 AI가 진지한 척하면서 차갑게 분석해주는 사이트.

타입: **웹**
스택: Next.js 16 (App Router) + TypeScript + TailwindCSS v4 + Gemini (OpenAI 호환 SDK 경유)

## 컨셉

- "진지한 연애 상담"이 아니라 **AI가 괜히 진지하게 분석하는데 결과는 웃긴** 서비스.
- 친구가 팩폭하는 톤. 반말. 짧고 임팩트 있게.
- 결과는 보통 호감 아님. 가끔 마지막에 한 줄 희망.

## 실행하기

```sh
npm install
cp .env.example .env.local   # GOOGLE_API_KEY 채워 넣기 (없어도 mock으로 돌아감)
npm run dev
```

`http://localhost:3000` 열기.

### Gemini API 키 발급

1. https://aistudio.google.com/app/apikey 접속 (구글 로그인)
2. **Create API key** 클릭 → 키 복사
3. `.env.local`의 `GOOGLE_API_KEY=` 뒤에 붙여넣기
4. `npm run dev` 재시작

무료 티어 분당 15회 / 일일 1500회. 카드 등록 안 받음.

### API 키 없이 돌리고 싶을 때

`GOOGLE_API_KEY`가 비어 있으면 [src/lib/examples.ts](src/lib/examples.ts)의 mock 응답을 입력 해시 기반으로 골라서 돌려줌. UI/스타일 작업할 때 편함.

## 구조

```
src/
├─ app/
│  ├─ layout.tsx          # 루트 레이아웃 + 메타데이터
│  ├─ page.tsx            # 메인 페이지
│  ├─ globals.css         # Tailwind + 애니메이션
│  └─ api/detect/route.ts # Gemini 호출 (POST, OpenAI 호환 엔드포인트)
├─ components/
│  ├─ DetectorCard.tsx    # 입력 폼 + 상태 관리
│  ├─ ResultCard.tsx      # 결과 카드 + 공유/복사
│  ├─ LoadingState.tsx    # 랜덤 로딩 문구
│  └─ Meter.tsx           # 희망회로 / 현실가능성 게이지
└─ lib/
   ├─ prompts.ts          # 시스템 프롬프트 + 사용자 프롬프트 빌더
   ├─ examples.ts         # 로딩 문구 / placeholder / mock 응답
   └─ types.ts            # 공용 타입
```

## API

### `POST /api/detect`

```json
{ "situation": "얘가 오늘 입에 뭐 묻은 거 떼줬어" }
```

응답:

```json
{
  "ok": true,
  "source": "openai",   // Gemini 응답이어도 source는 "openai"로 유지 (OpenAI SDK 경유라서 호환성 표기)
  "data": {
    "verdict": "호감_아님",
    "headline": "호감 아님.",
    "lines": ["그냥 위생 관리해준 거임.", "친구한테도 똑같이 함."],
    "hopeMeter": 14,
    "realityMeter": 8,
    "coldness": "AI 냉정도: 연애 세포 소멸 상태"
  }
}
```

- 입력은 최대 300자.
- 키 없거나 Gemini 호출 실패하면 mock으로 폴백 (`source: "mock"`).

## 배포

Vercel에 그대로 올리면 됨. 환경변수에 `GOOGLE_API_KEY` (선택: `GEMINI_MODEL`)만 넣으면 끝.

## 톤 규칙 (수정할 때 주의)

- 너무 따뜻하면 안 됨.
- 무조건 반말.
- 한 줄 한 줄 짧게.
- 너무 긍정으로 끝내지 말기. 마지막에 "근데 또 사람 일은 모르는 거긴 함." 같은 한 줄만 허용.
- 욕설/혐오/성적 발언 금지.

자세한 건 [src/lib/prompts.ts](src/lib/prompts.ts) 참고.
