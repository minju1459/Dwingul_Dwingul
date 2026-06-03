# 07 — 한로로 Universe 🌙

> 한로로의 곡 한 곡 한 곡을 작은 픽셀 에피소드로 풀어보는 인터랙티브.

타입: **웹**
스택: Next.js 16 (App Router) + React 19 + TypeScript + TailwindCSS v4 + framer-motion

## 컨셉

곡을 듣는 게 아니라 **곡 안으로 잠깐 들어가는** 경험.
- 회색 도시를 걷다가
- 아스팔트 틈에서 작은 풀꽃을 발견하고
- 봄으로 달려가서
- 파란 꽃 앞에 멈춰 서고
- "게임을 그만하시겠습니까?" — 그만하기 / 다음 에피소드로

## 첫 에피소드 — 입춘

`src/components/IpchunEpisode.tsx` 가 전부. 페이즈 5단계의 단방향
상태머신:

```
walk → discover → run → arrive → dialog
```

- **walk**: 회색 아스팔트 위 1.5px/frame. 풀꽃이 가까워질수록
  `drop-shadow` 2단으로 발광 세기가 점점 강해짐
- **discover**: 1.5초. 캐릭터 위로 `!` 가 surprisePop, 꽃은 펄스로
  깜빡임
- **run**: 3.5px/frame. 진행 거리에 따라 `lerpRGB` 로 하늘/지면
  색을 회색→파랑·회색→초록으로 보간. 비네트와 아스팔트 텍스처가
  동시에 페이드아웃. 바람 줄무늬 + 반짝이 레이어 마운트
- **arrive**: 파란 꽃 앞에서 감속. 펄스 발광 후 다이얼로그
- **dialog**: `IpchunDialog` 가 framer-motion 으로 등장.
  "그만하기" → 유튜브로, "다음 에피소드 거울" → 준비 중

## 실행하기

```bash
npm install
npm run dev    # 기본 localhost:3000 / 이 저장소에선 PORT=3007 로 띄움
```

## 구조

```
src/
  app/
    layout.tsx          Noto Sans KR + 한로로 메타데이터
    page.tsx            IpchunEpisode 마운트 + onQuit/onNext 핸들러
    globals.css         별 twinkle / 픽셀 bob·run-bob / windLine / sparkle
  components/
    IpchunEpisode.tsx   입춘 에피소드 상태머신 + 월드 + 픽셀 SVG
    IpchunDialog.tsx    입춘 엔딩 모달 (그만하기 / 다음 에피소드)
    PixelCharacter.tsx  픽셀 아트 주인공 SVG
    GameWorld.tsx       (다음 에피소드용) 가로 스크롤 자유 탐색 월드
    DialogBox.tsx       (다음 에피소드용) 곡 카드 모달
    SongCard.tsx        (다음 에피소드용) 곡 카드
  data/
    songs.ts            한로로 곡 메타데이터 + 월드 상수
```

## 향후 에피소드 (준비 중)

- 거울 — `다음 에피소드 →` 버튼이 연결될 곳
- 자캐, 파랗게, 명동 콜링, 휘파람 …

`data/songs.ts` 에 곡 별 메타데이터가 들어 있어서 같은 페이즈 패턴을
스키마처럼 재사용하는 방향으로 갈 예정.
