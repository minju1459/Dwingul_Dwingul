"use client";

import { useState } from "react";
import type { Letter } from "@/lib/types";
import { Taskbar } from "./Taskbar";
import { ReceivedLetter } from "@/components/letter/ReceivedLetter";
import { ComposeLetter } from "@/components/letter/ComposeLetter";
import { MailNotification } from "@/components/letter/MailNotification";

type Stage = "notification" | "reading" | "composing" | "sent";

type DesktopProps = {
  previousLetter: Letter;
};

export function Desktop({ previousLetter }: DesktopProps) {
  const [stage, setStage] = useState<Stage>("notification");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {stage === "notification" && (
        <CenteredOverlay>
          <MailNotification onOpen={() => setStage("reading")} />
        </CenteredOverlay>
      )}

      {stage !== "notification" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingBottom: 30,
            display: "flex",
            gap: 24,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            padding: 32,
          }}
        >
          <div style={{ transform: "translateY(-12px) rotate(-1deg)" }}>
            <ReceivedLetter letter={previousLetter} />
          </div>

          {(stage === "composing" || stage === "sent") && (
            <div style={{ transform: "translateY(12px) rotate(1deg)" }}>
              <ComposeLetter
                sent={stage === "sent"}
                onSend={() => setStage("sent")}
              />
            </div>
          )}

          {stage === "reading" && (
            <div style={{ alignSelf: "flex-end", marginBottom: 80 }}>
              <button
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 14,
                  padding: "8px 18px",
                }}
                onClick={() => setStage("composing")}
              >
                ✉ 답장 쓰기
              </button>
            </div>
          )}
        </div>
      )}

      <Taskbar />
    </div>
  );
}

function CenteredOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 30,
      }}
    >
      {children}
    </div>
  );
}
