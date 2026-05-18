"use client";

import { Window } from "@/components/window/Window";

type MailNotificationProps = {
  onOpen: () => void;
};

export function MailNotification({ onOpen }: MailNotificationProps) {
  return (
    <div style={{ animation: "mail-bounce 1.6s ease-in-out infinite" }}>
      <Window title="새 편지가 도착했습니다" width={360}>
        <div style={{ padding: "12px 8px 4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 40,
                lineHeight: 1,
              }}
              aria-hidden
            >
              ✉
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              오늘, 모르는 사람이
              <br />
              보낸 편지를 받았어요.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 12,
            }}
          >
            <button
              onClick={onOpen}
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 14,
                padding: "4px 18px",
                minWidth: 88,
              }}
            >
              열어보기
            </button>
            <button
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 14,
                padding: "4px 18px",
                minWidth: 88,
              }}
              disabled
            >
              나중에
            </button>
          </div>
        </div>
      </Window>

      <style jsx>{`
        @keyframes mail-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
