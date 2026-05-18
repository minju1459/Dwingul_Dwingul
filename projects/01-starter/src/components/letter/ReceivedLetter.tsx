"use client";

import type { Letter } from "@/lib/types";
import { Window } from "@/components/window/Window";

type ReceivedLetterProps = {
  letter: Letter;
};

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const h = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${y}.${m}.${day}  ${h}:${min}`;
}

export function ReceivedLetter({ letter }: ReceivedLetterProps) {
  return (
    <Window
      title={`${letter.chainNumber.toLocaleString()}번째 받은 편지 - 모르는편지`}
      width={440}
    >
      <div style={{ padding: "8px 4px 4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#333",
            borderBottom: "1px dashed #888",
            paddingBottom: 6,
            marginBottom: 12,
          }}
        >
          <span>보낸 사람: 익명</span>
          <span>{formatDate(letter.createdAt)}</span>
        </div>

        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 14,
            lineHeight: 1.9,
            minHeight: 200,
            padding: "8px 4px",
          }}
        >
          {letter.body}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#666",
            textAlign: "right",
            marginTop: 8,
            paddingTop: 6,
            borderTop: "1px dashed #888",
          }}
        >
          편지 #{letter.id}
        </div>
      </div>
    </Window>
  );
}
