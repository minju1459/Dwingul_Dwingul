"use client";

import { useEffect, useState } from "react";
import type { PressEvent } from "@/lib/types";

type BigButtonProps = {
  onPress: () => void;
  lastPress: PressEvent | null;
};

const PRESS_DEPTH = 14;

export function BigButton({ onPress, lastPress }: BigButtonProps) {
  const [pressing, setPressing] = useState(false);
  const [remoteShake, setRemoteShake] = useState(0);

  useEffect(() => {
    if (lastPress?.origin === "remote") {
      setRemoteShake((n) => n + 1);
    }
  }, [lastPress]);

  const handlePress = () => {
    onPress();
    setPressing(true);
    setTimeout(() => setPressing(false), 220);
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      aria-label="누르기"
      key={`shake-${remoteShake}`}
      style={{
        background: "transparent",
        border: 0,
        padding: 0,
        cursor: "pointer",
        animation: pressing ? undefined : "container-shake 0.5s ease-in-out",
      }}
    >
      <svg
        width={440}
        height={320}
        viewBox="0 0 440 320"
        style={{ display: "block" }}
      >
        <defs>
          <radialGradient id="baseTopGrad" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e6e6ec" />
            <stop offset="55%" stopColor="#c8c8d2" />
            <stop offset="100%" stopColor="#8e8e98" />
          </radialGradient>

          <linearGradient id="baseSideGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7e7e88" />
            <stop offset="20%" stopColor="#b0b0bc" />
            <stop offset="50%" stopColor="#dadae2" />
            <stop offset="80%" stopColor="#b0b0bc" />
            <stop offset="100%" stopColor="#7e7e88" />
          </linearGradient>

          <radialGradient id="discTopGrad" cx="38%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#ffb8b8" />
            <stop offset="35%" stopColor="#ff5a5a" />
            <stop offset="80%" stopColor="#cc1a1a" />
            <stop offset="100%" stopColor="#6e0808" />
          </radialGradient>

          <linearGradient id="discSideGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#8b1414" />
            <stop offset="25%" stopColor="#c01e1e" />
            <stop offset="50%" stopColor="#dc2828" />
            <stop offset="75%" stopColor="#c01e1e" />
            <stop offset="100%" stopColor="#8b1414" />
          </linearGradient>

          <radialGradient id="discHighlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          <filter id="groundShadow" x="-30%" y="-50%" width="160%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>

          <filter id="discDropShadow" x="-30%" y="-30%" width="160%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="8" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.45" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 바닥 그림자 */}
        <ellipse
          cx="220"
          cy="290"
          rx="180"
          ry="12"
          fill="rgba(0,0,0,0.7)"
          filter="url(#groundShadow)"
        />

        {/* 흰 받침대 옆면 (실린더) */}
        <path
          d="M 40,225 L 40,255 A 180 18 0 0 0 400,255 L 400,225 A 180 22 0 0 1 40,225 Z"
          fill="url(#baseSideGrad)"
        />

        {/* === 빨간 디스크 (눌리면 translateY) === */}
        <g
          style={{
            transform: pressing
              ? `translateY(${PRESS_DEPTH}px)`
              : "translateY(0)",
            transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transformBox: "view-box",
          }}
        >
          {/* 디스크 옆면 (실린더) — 위쪽 아치는 윗면 아래로 들어가서 안 보이고, 아래쪽은 받침에 가려짐 */}
          <path
            d="M 85,150 L 85,215 A 135 20 0 0 0 355,215 L 355,150 A 135 22 0 0 1 85,150 Z"
            fill="url(#discSideGrad)"
          />

          {/* 디스크 윗면 */}
          <ellipse
            cx="220"
            cy="150"
            rx="135"
            ry="22"
            fill="url(#discTopGrad)"
          />

          {/* 윗면 하이라이트 (큰 반사광) */}
          <ellipse
            cx="195"
            cy="138"
            rx="80"
            ry="10"
            fill="url(#discHighlight)"
          />
        </g>

        {/* === 흰 받침대 윗면 — 디스크 다음에 그려서 디스크 하단을 가림 === */}
        <ellipse
          cx="220"
          cy="225"
          rx="180"
          ry="22"
          fill="url(#baseTopGrad)"
        />

        {/* 디스크 밑의 그림자 — 디스크가 받침에 박혀 보이는 효과 */}
        <ellipse
          cx="220"
          cy="218"
          rx="140"
          ry="16"
          fill="rgba(0,0,0,0.55)"
        />
        <ellipse
          cx="220"
          cy="220"
          rx="135"
          ry="12"
          fill="rgba(0,0,0,0.4)"
        />
      </svg>

      <style>{`
        @keyframes container-shake {
          0%, 100% { translate: 0 0; }
          25%      { translate: -3px 1px; }
          50%      { translate: 3px -1px; }
          75%      { translate: -2px 2px; }
        }
      `}</style>
    </button>
  );
}
