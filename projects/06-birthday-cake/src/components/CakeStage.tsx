"use client";

import Image from "next/image";
import FlameCanvas, { type FlameCanvasHandle } from "./FlameCanvas";
import { CAKE_IMAGE_ASPECT, CAKE_IMAGE_SRC } from "@/lib/candleConfig";

type Props = {
  handleRef: React.MutableRefObject<FlameCanvasHandle | null>;
  onAllOut: () => void;
  onCandleOut: (x: number, y: number) => void;
};

export default function CakeStage({ handleRef, onAllOut, onCandleOut }: Props) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="relative w-full max-w-[640px] mx-auto"
        style={{ aspectRatio: `${CAKE_IMAGE_ASPECT}` }}
      >
        <Image
          src={CAKE_IMAGE_SRC}
          alt="생일 케이크"
          fill
          priority
          unoptimized
          sizes="(max-width: 768px) 92vw, 640px"
          className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)] select-none pointer-events-none"
        />
        <FlameCanvas
          handleRef={handleRef}
          onAllOut={onAllOut}
          onCandleOut={onCandleOut}
        />
      </div>
    </div>
  );
}
