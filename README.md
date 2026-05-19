# Dwingul_Dwingul

AI를 활용해서 뒹굴 뒹굴 프로젝트를 개발합니다.

여러 개의 작은 웹/앱 프로젝트를 한 레포에 모아두는 모노레포 구조입니다.
각 프로젝트는 `projects/` 아래에 독립적으로 들어가며, 그 자체로 실행/설치/배포가 완결됩니다.

## 구조

```
.
├── projects/         # 개별 프로젝트
│   ├── 01-starter/        (웹)
│   ├── 02-the-button/     (웹)
│   ├── 03-rainy-songs/    (웹)
│   └── 04-desktop-cat/    (앱 — macOS)
└── README.md         # 이 파일 (프로젝트 인덱스)
```

## 프로젝트 목록

| # | 이름 | 타입 | 스택 | 설명 |
|---|------|------|------|------|
| 01 | [starter](projects/01-starter/) | **웹** | Next.js + TypeScript | 모르는편지 — Y2K 윈도우 감성의 익명 편지 릴레이 |
| 02 | [the-button](projects/02-the-button/) | **웹** | Next.js + TypeScript | 이 세상에 하나뿐인 버튼 — 의미 없는 버튼 하나만 있는 사이트 |
| 03 | [rainy-songs](projects/03-rainy-songs/) | **웹** | Next.js + TypeScript | 비 오는 날의 메모 — 빗방울 클릭하면 펼쳐지는 비 오는 날 노래 리스트 |
| 04 | [desktop-cat](projects/04-desktop-cat/) | **앱 (macOS)** | Electron | 나고먐미인데 — macOS 데스크탑 위를 산책하는 작은 고양이 |

> **웹** = 브라우저에서 도는 사이트 (Vercel 등에 배포)
> **앱 (macOS)** = 본인 맥에 설치해서 도는 네이티브에 가까운 앱

## 새 프로젝트 추가하기

1. `projects/NN-이름/` 폴더로 추가
2. 폴더 안에 README.md (실행법 + 타입(웹/앱) 명시 포함) 작성
3. 위 표에 한 줄 추가
