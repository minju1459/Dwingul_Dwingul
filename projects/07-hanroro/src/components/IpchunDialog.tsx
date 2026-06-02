"use client";

import { motion } from "framer-motion";

interface Props {
  onQuit: () => void;
  onNext: () => void;
}

export default function IpchunDialog({ onQuit, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.93)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 배경 미세 파티클 */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 43 + 5) % 100}%`,
              top: `${(i * 31 + 10) % 100}%`,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: i % 3 === 0 ? "#86efac" : i % 3 === 1 ? "#93c5fd" : "#fde68a",
              opacity: 0.3,
              animation: `sparklePop ${1.5 + (i % 4) * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>

      {/* 다이얼로그 본체 */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 22 }}
        style={{
          position: "relative",
          textAlign: "center",
          padding: "0 28px",
          maxWidth: 420,
          width: "100%",
        }}
      >

        {/* 메인 질문 */}
        <h2
          style={{
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.04em",
            lineHeight: 1.4,
          }}
        >
          게임을 그만 하시겠습니까?
        </h2>

        {/* 서브타이틀 */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.38)",
            fontSize: 13,
            marginTop: 12,
            fontStyle: "italic",
            lineHeight: 1.6,
            letterSpacing: "0.02em",
          }}
        >
          불안한 청춘들이 새싹을 틔울 수 있도록
        </p>

        {/* 구분선 */}
        <div
          style={{
            margin: "24px auto",
            width: 48,
            height: 1,
            background: "rgba(255,255,255,0.12)",
          }}
        />

        {/* 버튼 */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {/* 그만하기 (왼쪽) */}
          <motion.button
            whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onQuit}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            그만하기
          </motion.button>

          {/* 다음 에피소드 (오른쪽) */}
          <motion.button
            whileHover={{ scale: 1.04, background: "rgba(134,239,172,0.22)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onNext}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 12,
              background: "rgba(134,239,172,0.12)",
              border: "1px solid rgba(134,239,172,0.35)",
              color: "#86efac",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            다음 에피소드 "거울" →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
