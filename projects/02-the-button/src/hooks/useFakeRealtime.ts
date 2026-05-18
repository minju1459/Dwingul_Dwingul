"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ButtonStateSnapshot, PressEvent } from "@/lib/types";

const INITIAL_TOTAL_PRESSES = 1_284_207;
const INITIAL_AWAKE = 1_284;

/** 다른 사람 클릭 시뮬레이션 간격 (랜덤 ms). */
const REMOTE_MIN_MS = 1_800;
const REMOTE_MAX_MS = 7_000;

/** 접속자 수가 출렁이는 간격. */
const AWAKE_DRIFT_MS = 5_000;

function nextRemoteDelay() {
  return REMOTE_MIN_MS + Math.random() * (REMOTE_MAX_MS - REMOTE_MIN_MS);
}

export type UseFakeRealtimeResult = {
  state: ButtonStateSnapshot;
  /** 가장 최근에 발생한 누름 이벤트 (애니메이션 트리거용). */
  lastPress: PressEvent | null;
  /** 본인이 버튼을 눌렀을 때 호출. */
  pressLocal: () => void;
};

export function useFakeRealtime(): UseFakeRealtimeResult {
  const [state, setState] = useState<ButtonStateSnapshot>(() => ({
    awakeCount: INITIAL_AWAKE,
    totalPresses: INITIAL_TOTAL_PRESSES,
    lastPressedAt: new Date(),
  }));
  const [lastPress, setLastPress] = useState<PressEvent | null>(null);

  const remoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerRemote = useCallback(() => {
    setState((prev) => ({
      ...prev,
      totalPresses: prev.totalPresses + 1,
      lastPressedAt: new Date(),
    }));
    setLastPress({ at: new Date(), origin: "remote" });
  }, []);

  const pressLocal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      totalPresses: prev.totalPresses + 1,
      lastPressedAt: new Date(),
    }));
    setLastPress({ at: new Date(), origin: "self" });
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      remoteTimer.current = setTimeout(() => {
        triggerRemote();
        scheduleNext();
      }, nextRemoteDelay());
    };
    scheduleNext();
    return () => {
      if (remoteTimer.current) clearTimeout(remoteTimer.current);
    };
  }, [triggerRemote]);

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return {
          ...prev,
          awakeCount: Math.max(50, prev.awakeCount + delta),
        };
      });
    }, AWAKE_DRIFT_MS);
    return () => clearInterval(id);
  }, []);

  return { state, lastPress, pressLocal };
}
