export interface Song {
  title: string;
  year: string;
  mood: string;       // 감성 한 줄
  color: string;      // 세그먼트 포인트 색
  skyTop: string;     // 하늘 그라디언트 상단
  skyBottom: string;  // 하늘 그라디언트 하단
  groundColor: string;
  youtubeQuery: string;
  // 나중에 추가할 것들:
  // outfit?: string  // 캐릭터 착장
  // weather?: string // 날씨 효과
  // obstacle?: string // 장애물 스타일
}

export const SONGS: Song[] = [
  {
    title: "입춘",
    year: "2017",
    mood: "봄의 시작, 설레는 첫 걸음",
    color: "#86efac",
    skyTop: "#052e16",
    skyBottom: "#14532d",
    groundColor: "#166534",
    youtubeQuery: "한로로 입춘",
  },
  {
    title: "파랗게",
    year: "2019",
    mood: "새벽같은 파란 감성",
    color: "#93c5fd",
    skyTop: "#0c1445",
    skyBottom: "#1e3a5f",
    groundColor: "#1e40af",
    youtubeQuery: "한로로 파랗게",
  },
  {
    title: "소나기",
    year: "2020",
    mood: "여름, 갑작스러운 설렘",
    color: "#67e8f9",
    skyTop: "#0c2a4a",
    skyBottom: "#0e7490",
    groundColor: "#155e75",
    youtubeQuery: "한로로 소나기",
  },
  {
    title: "너는",
    year: "2020",
    mood: "봄날 같은 포근한 사랑",
    color: "#f9a8d4",
    skyTop: "#3b0764",
    skyBottom: "#701a75",
    groundColor: "#9d174d",
    youtubeQuery: "한로로 너는",
  },
  {
    title: "밤새",
    year: "2021",
    mood: "밤새 그리워하는 새벽",
    color: "#c4b5fd",
    skyTop: "#0f0523",
    skyBottom: "#2e1065",
    groundColor: "#3730a3",
    youtubeQuery: "한로로 밤새",
  },
  {
    title: "피어나",
    year: "2021",
    mood: "꽃처럼 피어나는 희망",
    color: "#fde68a",
    skyTop: "#1c0a00",
    skyBottom: "#431407",
    groundColor: "#92400e",
    youtubeQuery: "한로로 피어나",
  },
  {
    title: "나의 사랑을 받아줘",
    year: "2022",
    mood: "솔직한 사랑 고백",
    color: "#fca5a5",
    skyTop: "#1a0000",
    skyBottom: "#450a0a",
    groundColor: "#991b1b",
    youtubeQuery: "한로로 나의 사랑을 받아줘",
  },
  {
    title: "game over",
    year: "2024",
    mood: "끝이자 새로운 시작",
    color: "#a78bfa",
    skyTop: "#000000",
    skyBottom: "#0f0a1e",
    groundColor: "#1e1b4b",
    youtubeQuery: "한로로 game over",
  },
];

// 게임 상수
export const SEGMENT_WIDTH = 900;   // 곡당 세그먼트 px 너비
export const GROUND_HEIGHT = 72;    // 지면 높이 px
export const CHARACTER_SCREEN_X = 200; // 화면 내 캐릭터 고정 x 위치
export const WORLD_SPEED = 1.6;     // 스크롤 속도 (px/frame)
