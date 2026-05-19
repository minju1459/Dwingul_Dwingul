export type Song = {
  artist: string;
  title: string;
};

export const SONGS: Song[] = [
  { artist: "에픽하이", title: "우산" },
  { artist: "태연", title: "Rain" },
  { artist: "긱스", title: "비가 오네" },
  { artist: "폴킴", title: "비" },
  { artist: "아이유", title: "Rain Drop" },
  { artist: "잔나비", title: "주저하는 연인들을 위해" },
  { artist: "카더가든", title: "명동콜링" },
  { artist: "헤이즈", title: "비가 오고 그래서" },
  { artist: "이클립스", title: "소나기" },
  { artist: "릴러말즈", title: "비 내리면" },
];

export function shuffledDeck(): Song[] {
  return [...SONGS].sort(() => Math.random() - 0.5);
}
