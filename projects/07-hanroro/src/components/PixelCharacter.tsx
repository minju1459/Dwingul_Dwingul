"use client";

// ─── 입춘 팔레트 ───────────────────────────────────────────────────────────
const I = {
  _: "transparent",
  H: "#1c1417",   // 거의 검정 단발 머리
  S: "#fcd5b4",   // 피부
  E: "#1e1e2e",   // 눈
  BD: "#f4a261",  // 데일밴드 (오렌지)
  BL: "#fde68a",  // 데일밴드 밝은 줄
  W: "#f8fafc",   // 흰 반팔 티셔츠
  WS: "#cbd5e1",  // 티셔츠 그림자·주름
  JB: "#3b82f6",  // 청바지
  JD: "#1d4ed8",  // 청바지 솔기
  RS: "#ef4444",  // 빨간 캔버스화
  RD: "#991b1b",  // 운동화 밑창
};

// 16 × 16 픽셀 스프라이트 (입춘: 단발 소녀)
const SPRITE_IPCHUN: string[][] = [
  [I._,I._,I._,I.H,I.H,I.H,I.H,I.H,I.H,I.H,I.H,I._,I._,I._,I._,I._],
  [I._,I._,I.H,I.H,I.H,I.H,I.H,I.H,I.H,I.H,I.H,I.H,I._,I._,I._,I._],
  [I._,I.H,I.H,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.H,I.H,I._,I._],
  [I._,I.H,I.S,I.S,I.E,I.S,I.S,I.S,I.S,I.E,I.S,I.S,I.H,I._,I._,I._],
  [I._,I.H,I.S,I.BD,I.BL,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.H,I._,I._,I._],
  [I._,I.H,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.S,I.H,I._,I._],
  [I._,I._,I.H,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.H,I._,I._,I._],
  [I._,I._,I.W,I.WS,I.W,I.W,I.W,I.W,I.W,I.WS,I.W,I.W,I.W,I._,I._,I._],
  [I._,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I._,I._],
  [I._,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I.W,I._,I._],
  [I._,I._,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I._,I._,I._],
  [I._,I._,I.JB,I.JB,I.JD,I.JB,I.JB,I.JB,I.JB,I.JD,I.JB,I.JB,I.JB,I._,I._,I._],
  [I._,I._,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I.JB,I._,I._,I._],
  [I._,I._,I._,I.JB,I.JB,I._,I._,I._,I._,I.JB,I.JB,I._,I._,I._,I._,I._],
  [I._,I._,I._,I.RS,I.RS,I._,I._,I._,I._,I.RS,I.RS,I._,I._,I._,I._,I._],
  [I._,I._,I.RD,I.RD,I.RD,I._,I._,I._,I._,I.RD,I.RD,I.RD,I._,I._,I._,I._],
];

// 나머지 곡들은 입춘 스프라이트 사용 (추후 곡별 착장 추가 예정)
const SPRITES: Record<number, string[][]> = {
  0: SPRITE_IPCHUN,
};

const PIXEL = 5;

interface Props {
  isMoving?: boolean;
  outfitIndex?: number;
  className?: string; // 외부에서 애니메이션 클래스 직접 지정 (에피소드용)
}

export default function PixelCharacter({ isMoving = true, outfitIndex = 0, className }: Props) {
  const sprite = SPRITES[outfitIndex] ?? SPRITES[0];
  const defaultAnim = isMoving ? "pixel-bob" : "pixel-float";
  const animClass = className ?? defaultAnim;

  return (
    <div className={`${animClass} flex flex-col items-center select-none`}>
      <svg
        width={sprite[0].length * PIXEL}
        height={sprite.length * PIXEL}
        className="pixel-art"
        style={{
          imageRendering: "pixelated",
          filter: "drop-shadow(0 0 10px rgba(167,139,250,0.7))",
        }}
      >
        {sprite.map((row, y) =>
          row.map((color, x) =>
            color !== I._ ? (
              <rect
                key={`${x}-${y}`}
                x={x * PIXEL}
                y={y * PIXEL}
                width={PIXEL}
                height={PIXEL}
                fill={color}
              />
            ) : null
          )
        )}
        {/* 마법 반짝이 */}
        <circle cx={2} cy={4} r={1.5} fill="#f9a8d4" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={78} cy={12} r={1} fill="#67e8f9" opacity="0.8">
          <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={8} cy={60} r={1.2} fill="#a78bfa" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </svg>
      {/* 그림자 */}
      <div
        className="rounded-full opacity-20 blur-sm"
        style={{ width: 44, height: 6, background: "#7c3aed", marginTop: 2 }}
      />
    </div>
  );
}
