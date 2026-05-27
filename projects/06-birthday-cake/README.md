# 06 — Birthday Cake (Clap to Blow)

박수를 치면 촛불이 하나씩 꺼지는 감성 인터랙티브 웹사이트.

## 컨셉
- 검정 무대 위에 케이크 한 판
- 5개의 촛불이 미세하게 흔들림
- 박수 1회 = 촛불 1개 꺼짐 (왼쪽부터 순차적)
- 꺼질 때마다 잔불 → 연기 → 작은 confetti
- 5개 다 꺼지면 "Happy Birthday" + confetti cannon
- 다시 불 켜기 (Replay) 버튼

## 입력 방식
1. **마이크 박수** (1순위) — `getUserMedia` + `AnalyserNode` RMS 피크 + 어택 감지 + debounce
2. **화면 탭/클릭** (fallback) — 마이크 권한 거부 또는 미지원 환경에서 자동 활성화

## 에셋 준비 (필수)
`public/cake-base.png` 위치에 **불 꺼진 케이크 PNG** 한 장을 저장해야 함.
- 권장 사이즈: 1394 × 1147 (또는 동일 비율)
- 투명 또는 흰 배경 둘 다 OK (`object-contain` 으로 표시됨)
- 5개 초 끝(심지 끝) 좌표가 [src/lib/candleConfig.ts](src/lib/candleConfig.ts) 의
  `CANDLE_ANCHORS` 와 맞아야 함. 이미지 교체 시 좌표 미세 조정 필요.

## 실행
```bash
npm install
npm run dev
```
- 마이크는 HTTPS 또는 localhost 에서만 동작
- 모바일 사파리는 사용자 터치 후에만 권한 요청 가능 (현재 구조가 이 조건 만족)

## 구조
```
src/
  app/
    layout.tsx       메타데이터, 한국어 lang
    page.tsx         BirthdayScene 마운트만
    globals.css      검정 배경, 등장 애니메이션
  components/
    BirthdayScene.tsx   상태 머신 (intro → listening → celebrating)
    CakeStage.tsx       케이크 이미지 + 캔버스 오버레이 컨테이너
    FlameCanvas.tsx     5개 촛불 Canvas 2D 렌더링, extinguishNext API
    ConfettiLayer.tsx   화면 전역 confetti 캔버스
    Hint.tsx            안내 문구 + 박수 카운터 점
    Celebration.tsx     Happy Birthday 타이틀
    ReplayButton.tsx    다시 불 켜기
  lib/
    candleConfig.ts     5개 촛불의 상대 좌표
    flameRenderer.ts    불꽃 + 잔불 + 연기 파티클 그리기
    confetti.ts         confetti 파티클 그리기
    useClapDetection.ts 마이크 박수 감지 hook
```

## 상태 흐름
```
intro
  ↓ (시작하기 클릭)
listening  — 박수 감지 ON
  ↓ (5번째 박수로 마지막 촛불 out)
celebrating  — confetti cannon + Happy Birthday
  ↓ (Replay)
intro
```

## 향후 확장 후보 (현재 미구현)
- `?to=&from=&msg=` URL 파라미터로 받는 사람 / 보낸 사람 / 메시지 커스터마이징
- 카운트다운 (3·2·1) 후 박수 감지 시작
- 끝난 순간 영상 4~6초 자동 녹화 (MediaRecorder + canvas stream)
- 사운드 (박수 인식 효과음, 환호성, 촛불 꺼지는 puff)
