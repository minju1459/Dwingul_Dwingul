# 08 — WAKPPU (ASMR 왁뿌 시뮬레이터)

> 딱딱한 겉면을 누르면 오도독 부서지는 ASMR 왁뿌. 직접 색깔도 조합해서 만들 수 있음.

타입: **웹**
스택: Next.js 16 + React 19 + TypeScript + TailwindCSS v4 + framer-motion + Canvas 2D + Web Audio API

## 컨셉

실제 왁뿌(왁스+뽀로로) 장난감을 디지털로 옮긴 인터랙션. 그래픽보다 **촉감 + 사운드**를
가장 우선. 한 번 누르려고 들어왔다가 10분씩 부수고 있게 만드는 게 목표.

## 인터랙션 흐름

5단계 균열:
```
idle → 작은 균열 → 균열 확대 → 파편 일부 → 슬라임 노출 → 완전 파괴
                                                                ↓
                                                       다시 만들기 (역 애니메이션)
```

- 매 클릭마다 **다른 사운드** (Web Audio API 합성, 매번 freq/Q/decay/gain 랜덤)
- 단계가 올라갈수록 사운드가 묵직해지고 균열 분기가 많아짐
- 슬라임 노출 후엔 같은 자리를 잡고 끌면 **출렁이며 늘어남**
- 완파 시 작은 환호 jingle + 화면 강한 흔들림 + 30ms 진동(모바일)

## 왁뿌 종류

- **무지개 도넛** — 도넛형, 안쪽 무지개 그라데이션 + 하얀 왁스 코팅 + 스프링클
- **청사과** — 연두 유광, 안쪽 흰색 슬라임
- **초코민트** — 짙은 초코, 안쪽 민트 슬라임
- **+ 직접 만들기** — 모양(통/도넛) · 겉 색깔 · 속 색깔 · 부서지는 음색 직접 조합

## 사운드 합성

`src/lib/wakppu/sound.ts` 가 전부. 외부 mp3 의존성 없음.

- 짧은 흰 노이즈 burst → bandpass filter → highpass → gain envelope
- `toneHint` (light/medium/heavy) 가 베이스 freq/decay 범위를 정함
- `stage` 가 그 위에 multiplier (1단계는 가볍게, 5단계는 묵직 + sub thud)
- 매 호출마다 모든 파라미터가 정해진 범위 안에서 랜덤 → 같은 소리 두 번 안 남
- 다시 만들기는 sine sweep (220→660Hz), 완파 jingle 은 A5-C#6-E6 짧은 chord

mp3 로 교체하고 싶으면 `playCrack(stage, tone)` 시그니처 그대로 두고 내부만 갈아끼우면 됨.

## 진동 & 모바일

- `navigator.vibrate(12)` 매 단계, `navigator.vibrate(30)` 완파
- `touch-action: none` 으로 스크롤/줌 방지
- `pointerdown/move/up` 으로 마우스+터치 통합 처리

## 이스터에그

총 파괴 100 번째에 **황금 왁뿌**가 등장. 다시 만들기 누르면 노출.
localStorage 에 누적 카운트 저장.

## 실행

```bash
npm install
npm run dev  # 기본 localhost:3000 / 이 저장소에선 PORT=3008 로 띄움
```

## 구조

```
src/
  app/
    layout.tsx              메타데이터
    page.tsx                WakppuStage 마운트
    globals.css             검정 무대 + 흔들림/슬라임-bob/황금 키프레임
  components/
    WakppuStage.tsx         상태 머신 + 인터랙션 (pointer/사운드/진동/카운터/이스터에그)
    WakppuCanvas.tsx        Canvas 2D 루프 (왁뿌 본체/슬라임/균열/파편)
    VariantPicker.tsx       3개 프리셋 + "+ 만들기" 버튼 하단 픽커
    CustomMaker.tsx         색상/모양/음색 골라서 내 왁뿌 만들기 모달
    RebuildButton.tsx       완파 후 등장, rare 모드시 골든 그라데이션
    Stats.tsx               누적 파괴 / 연속 카운터
  lib/wakppu/
    types.ts                WakppuVariant, CrackStage, ToneHint
    variants.ts             3개 프리셋 + makeCustomVariant + 색 유틸
    wakppuRenderer.ts       drawShell, drawSlime (Canvas 2D)
    crackSystem.ts          BFS 분기 균열 폴리라인
    shardSystem.ts          파편 폴리곤 + 먼지 파티클
    sound.ts                Web Audio 합성 (crack/reassemble/jingle)
```
