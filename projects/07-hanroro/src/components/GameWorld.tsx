"use client";

import { SONGS, SEGMENT_WIDTH, GROUND_HEIGHT } from "@/data/songs";

// 체크포인트 x 위치 (각 세그먼트 80% 지점)
export function getCheckpointX(index: number) {
  return index * SEGMENT_WIDTH + SEGMENT_WIDTH * 0.8;
}

export default function GameWorld() {
  const totalWidth = SEGMENT_WIDTH * SONGS.length + 600;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: totalWidth,
        height: "100vh",
      }}
    >
      {/* 하늘 세그먼트 (곡별 색상) */}
      {SONGS.map((song, i) => (
        <div
          key={`sky-${i}`}
          style={{
            position: "absolute",
            left: i * SEGMENT_WIDTH,
            top: 0,
            width: SEGMENT_WIDTH,
            height: "100%",
            background: `linear-gradient(to bottom, ${song.skyTop} 0%, ${song.skyBottom} 70%, #0a0a1a 100%)`,
            transition: "all 0.5s",
          }}
        />
      ))}

      {/* 마지막 여백 배경 */}
      <div
        style={{
          position: "absolute",
          left: SONGS.length * SEGMENT_WIDTH,
          top: 0,
          width: 600,
          height: "100%",
          background: "#000",
        }}
      />

      {/* 지면 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: totalWidth,
          height: GROUND_HEIGHT,
          background: "#0d0d1a",
          borderTop: "2px solid rgba(167,139,250,0.3)",
        }}
      />

      {/* 세그먼트별 지면 색조 */}
      {SONGS.map((song, i) => (
        <div
          key={`ground-${i}`}
          style={{
            position: "absolute",
            bottom: 0,
            left: i * SEGMENT_WIDTH,
            width: SEGMENT_WIDTH,
            height: GROUND_HEIGHT,
            background: `linear-gradient(to right, transparent, ${song.color}18, transparent)`,
          }}
        />
      ))}

      {/* 체크포인트 (장애물 + 곡 정보) */}
      {SONGS.map((song, i) => {
        const cx = getCheckpointX(i);
        return (
          <div
            key={`checkpoint-${i}`}
            style={{
              position: "absolute",
              left: cx,
              bottom: GROUND_HEIGHT,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* 곡 정보 말풍선 */}
            <div
              style={{
                background: "rgba(10,10,26,0.85)",
                border: `1px solid ${song.color}55`,
                borderRadius: 12,
                padding: "6px 14px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
                marginBottom: 4,
              }}
            >
              <p style={{ color: song.color, fontSize: 10, opacity: 0.8 }}>{song.year}</p>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{song.title}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>{song.mood}</p>
            </div>

            {/* 장애물 (픽셀 배리어) */}
            <Barrier color={song.color} />
          </div>
        );
      })}

      {/* 지면 장식 (음표 등) */}
      {SONGS.map((song, i) =>
        [0.25, 0.5].map((pos, j) => (
          <span
            key={`note-${i}-${j}`}
            style={{
              position: "absolute",
              left: i * SEGMENT_WIDTH + SEGMENT_WIDTH * pos,
              bottom: GROUND_HEIGHT + 20 + j * 30,
              color: song.color,
              fontSize: 14,
              opacity: 0.25,
              animation: `floatNote ${2.5 + j}s ease-in-out infinite`,
              animationDelay: `${j * 0.8}s`,
              pointerEvents: "none",
            }}
          >
            {j === 0 ? "♪" : "♫"}
          </span>
        ))
      )}

      {/* 세그먼트 구분선 */}
      {SONGS.map((_, i) => (
        <div
          key={`divider-${i}`}
          style={{
            position: "absolute",
            left: (i + 1) * SEGMENT_WIDTH,
            bottom: 0,
            width: 1,
            height: "100%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
      ))}
    </div>
  );
}

// 픽셀 장애물
function Barrier({ color }: { color: string }) {
  return (
    <svg
      width={44}
      height={56}
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      {/* 기둥 */}
      <rect x={20} y={0} width={4} height={56} fill={color} opacity={0.85} />
      {/* 판자 3개 */}
      {[8, 24, 40].map((y, idx) => (
        <g key={y}>
          <rect x={4} y={y} width={36} height={7} fill={color} opacity={0.75 - idx * 0.15} rx={1} />
          {/* 경고 줄무늬 */}
          <rect x={4} y={y} width={9} height={7} fill="#fbbf24" opacity={0.55} rx={1} />
          <rect x={22} y={y} width={9} height={7} fill="#fbbf24" opacity={0.55} rx={1} />
        </g>
      ))}
    </svg>
  );
}
