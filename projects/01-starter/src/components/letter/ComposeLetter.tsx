"use client";

import { useState } from "react";
import { Window } from "@/components/window/Window";

type ComposeLetterProps = {
  sent: boolean;
  onSend: () => void;
};

const PLACEHOLDER = `여기에 답장을 적어주세요.

당신의 편지는 다음 한 명의 모르는 사람에게 전달됩니다.
얼굴도 이름도 모르는 누군가에게, 오늘 하루를 들려주세요.`;

export function ComposeLetter({ sent, onSend }: ComposeLetterProps) {
  const [body, setBody] = useState("");

  if (sent) {
    return (
      <Window title="편지를 보냈습니다" width={420}>
        <div style={{ padding: "20px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden>
            ✉
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            당신의 편지가
            <br />
            다음 모르는 사람에게 전달되었습니다.
          </div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
            언젠가 또 다른 편지가 당신에게 도착할지도 몰라요.
          </div>
          <button
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 14,
              padding: "4px 24px",
            }}
            onClick={() => window.location.reload()}
          >
            닫기
          </button>
        </div>
      </Window>
    );
  }

  return (
    <Window title="다음 접속자에게 편지 쓰기 - 모르는편지" width={420}>
      <div style={{ padding: "8px 4px" }}>
        <div
          style={{
            fontSize: 12,
            color: "#333",
            marginBottom: 8,
          }}
        >
          받는 사람: 곧 접속할 모르는 누군가 (익명)
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={10}
          style={{
            width: "100%",
            fontFamily: "var(--font-pixel)",
            fontSize: 14,
            lineHeight: 1.8,
            padding: 8,
            resize: "none",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 11, color: "#666" }}>
            글자 수: {body.length}
          </span>
          <button
            onClick={onSend}
            disabled={body.trim().length < 10}
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 14,
              padding: "4px 20px",
              minWidth: 96,
            }}
          >
            보내기
          </button>
        </div>
      </div>
    </Window>
  );
}
