"use client";

import { motion } from "framer-motion";
import type { Song } from "@/data/songs";

interface Props {
  song: Song;
  onContinue: () => void;
  onYouTube: () => void;
}

export default function DialogBox({ song, onContinue, onYouTube }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          background: "rgba(10, 10, 30, 0.95)",
          border: `1px solid ${song.color}44`,
          borderRadius: 20,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          boxShadow: `0 0 40px ${song.color}22`,
        }}
      >
        {/* 게임 아이콘 */}
        <div style={{ fontSize: 36, marginBottom: 4 }}>🎮</div>

        {/* 제목 */}
        <h2
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.03em",
          }}
        >
          게임을 그만 하시겠습니까?
        </h2>

        {/* 곡 정보 박스 */}
        <div
          style={{
            marginTop: 20,
            borderRadius: 14,
            padding: "14px 18px",
            background: `${song.color}11`,
            border: `1px solid ${song.color}33`,
          }}
        >
          <p style={{ color: `${song.color}aa`, fontSize: 11, marginBottom: 4 }}>
            {song.year}
          </p>
          <p style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>
            {song.title}
          </p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4 }}>
            {song.mood}
          </p>
        </div>

        {/* 버튼 */}
        <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
          {/* 왼쪽: 유튜브로 이동 */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onYouTube}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              background: `${song.color}22`,
              border: `1px solid ${song.color}55`,
              color: song.color,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🎵 네, 들으러 갈게요
          </motion.button>

          {/* 오른쪽: 계속 진행 */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            아니요, 계속! →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
