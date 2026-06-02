"use client";

import { useEffect, useRef, useState } from "react";
import PixelCharacter from "./PixelCharacter";
import IpchunDialog from "./IpchunDialog";

// ─── 월드 상수 ─────────────────────────────────────────────────────────────
const GROUND_H   = 72;
const CHAR_X     = 220;
const GLOW_START = 480;    // 꽃이 빛나기 시작하는 world-x
const FLOWER_X   = 700;    // 꽃 발견 → 멈춤  (~8s walk)
const TRANS_DIST = 550;    // 배경 전환 거리(px)
const BLUE_X     = 2250;   // 파란 꽃 world-x
const TOTAL_W    = 2800;

const WALK_SPEED   = 1.5;  // 빠른 걷기 (8s)
const RUN_SPEED    = 3.5;  // 달리기 (~8s)
const ARRIVE_SPEED = 1.4;

type Phase = "walk" | "discover" | "run" | "arrive" | "dialog";

// ─── 색상 보간 ─────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}
type RGB = [number, number, number];
function lerpRGB(c1: RGB, c2: RGB, t: number) {
  return `rgb(${lerp(c1[0],c2[0],t)},${lerp(c1[1],c2[1],t)},${lerp(c1[2],c2[2],t)})`;
}

const GRAY_TOP: RGB  = [60,  60,  70 ];
const GRAY_BOT: RGB  = [105, 105, 115];
const BLUE_TOP: RGB  = [14,  165, 233];
const BLUE_BOT: RGB  = [186, 230, 253];
const GRAY_GND: RGB  = [72,  72,  78 ];
const GREEN_GND: RGB = [74,  222, 128];

// ─── 픽셀 나무 ─────────────────────────────────────────────────────────────
const TREE_ROWS = [
  "  LLL  ",
  " LLLLL ",
  "LLLLLLL",
  " LLLLL ",
  "LLLLLLL",
  " LLLLL ",
  "  LLL  ",
  "   T   ",
  "   T   ",
  "   T   ",
  "   T   ",
];

function PixelTree({ p = 4, light = "#4ade80", dark = "#15803d" }: {
  p?: number; light?: string; dark?: string;
}) {
  const W = 7 * p;
  const H = TREE_ROWS.length * p;
  return (
    <svg width={W} height={H} style={{ imageRendering: "pixelated", display: "block" }}>
      {TREE_ROWS.map((row, y) =>
        row.split("").map((c, x) => {
          if (c === "L") {
            const fill = y <= 2 ? light : y <= 5 ? dark : light;
            return <rect key={`${x}-${y}`} x={x*p} y={y*p} width={p} height={p} fill={fill} />;
          }
          if (c === "T") return <rect key={`${x}-${y}`} x={x*p} y={y*p} width={p} height={p} fill="#78350f" />;
          return null;
        })
      )}
    </svg>
  );
}

// ─── 풀꽃 (아스팔트 위 작은 꽃) ─────────────────────────────────────────────
function SmallFlower({ p = 5 }: { p?: number }) {
  const rows = [" Y ", "YCY", " Y ", " G ", " G "];
  return (
    <svg width={3*p} height={5*p} style={{ imageRendering: "pixelated", display: "block" }}>
      {rows.map((row, y) =>
        row.split("").map((c, x) => {
          const fill = c==="Y"?"#fde68a" : c==="C"?"#fbbf24" : c==="G"?"#4ade80" : null;
          return fill ? <rect key={`${x}-${y}`} x={x*p} y={y*p} width={p} height={p} fill={fill} /> : null;
        })
      )}
    </svg>
  );
}

// ─── 파란 최종 꽃 ─────────────────────────────────────────────────────────
const BLUE_ROWS = [
  "   B   ",
  "  BBB  ",
  " BBBBB ",
  "BBBBBBB",
  " BBBBB ",
  "  BCB  ",
  "   G   ",
  "   G   ",
  "  GGG  ",
];

function BlueFinalFlower({ glowRef, onReady }: {
  glowRef: React.RefObject<HTMLDivElement | null>;
  onReady?: () => void;
}) {
  const p = 6;
  const W = 7*p, H = BLUE_ROWS.length*p;
  return (
    <div ref={glowRef} style={{ cursor: "pointer" }} onClick={onReady}>
      <svg width={W} height={H} style={{ imageRendering: "pixelated", display: "block" }}>
        {BLUE_ROWS.map((row, y) =>
          row.split("").map((c, x) => {
            const fill = c==="B"
              ? (y<2 ? "#bfdbfe" : y<5 ? "#60a5fa" : "#2563eb")
              : c==="C" ? "#fde68a"
              : c==="G" ? "#4ade80"
              : null;
            return fill ? <rect key={`${x}-${y}`} x={x*p} y={y*p} width={p} height={p} fill={fill} /> : null;
          })
        )}
      </svg>
    </div>
  );
}

// ─── 봄 구간 나무 배치 ─────────────────────────────────────────────────────
const TREES = [
  { x: 820, p:5,  light:"#4ade80", dark:"#16a34a" },
  { x: 970, p:4,  light:"#86efac", dark:"#22c55e" },
  { x:1130, p:6,  light:"#22c55e", dark:"#15803d" },
  { x:1290, p:4,  light:"#4ade80", dark:"#16a34a" },
  { x:1450, p:5,  light:"#86efac", dark:"#22c55e" },
  { x:1600, p:4,  light:"#22c55e", dark:"#15803d" },
  { x:1760, p:6,  light:"#4ade80", dark:"#16a34a" },
  { x:1910, p:4,  light:"#86efac", dark:"#22c55e" },
  { x:2060, p:5,  light:"#22c55e", dark:"#15803d" },
  { x:2180, p:4,  light:"#4ade80", dark:"#16a34a" },
];

// ─── 봄 구간 작은 꽃 배치 ─────────────────────────────────────────────────
const SFWRS = [
  { x: 840, c:"#f9a8d4" },{ x: 980, c:"#fde68a" },{ x:1120, c:"#ddd6fe" },
  { x:1270, c:"#f9a8d4" },{ x:1420, c:"#86efac" },{ x:1570, c:"#fde68a" },
  { x:1720, c:"#fca5a5" },{ x:1870, c:"#ddd6fe" },{ x:2020, c:"#f9a8d4" },
  { x:2140, c:"#fde68a" },{ x:2200, c:"#93c5fd" },
];

// ─── 바람 줄무늬 ──────────────────────────────────────────────────────────
function WindLines() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:6, pointerEvents:"none", overflow:"hidden" }}>
      {Array.from({ length:10 }, (_,i) => (
        <div key={i} style={{
          position:"absolute",
          top:`${6 + i*9}%`,
          right:0,
          width: 60 + (i%3)*45,
          height: 1.5,
          background:`rgba(255,255,255,${0.12 + (i%4)*0.05})`,
          animation:`windLine ${0.48 + (i%4)*0.13}s linear infinite`,
          animationDelay:`${i*0.09}s`,
        }}/>
      ))}
    </div>
  );
}

// ─── 반짝이 ───────────────────────────────────────────────────────────────
function SparkleLayer() {
  const list = Array.from({ length:20 }, (_,i) => ({
    left:`${(i*47+3)%100}%`,
    top:`${(i*29+7)%88}%`,
    size: 4 + (i%3)*2,
    color:["#fde68a","#f9a8d4","#93c5fd","#86efac","#ddd6fe"][i%5],
    dur: 0.7 + (i%4)*0.2,
    del: i*0.11,
  }));
  return (
    <div style={{ position:"fixed", inset:0, zIndex:6, pointerEvents:"none" }}>
      {list.map((s,i) => (
        <div key={i} style={{
          position:"absolute", left:s.left, top:s.top,
          width:s.size, height:s.size, borderRadius:"50%",
          background:s.color,
          boxShadow:`0 0 ${s.size*2}px ${s.color}`,
          animation:`sparklePop ${s.dur}s ease-in-out infinite`,
          animationDelay:`${s.del}s`,
        }}/>
      ))}
    </div>
  );
}

// ─── 픽셀 구름 ────────────────────────────────────────────────────────────
const CLOUDS = [
  { top:5,  spd:24, w:90,  del:0  },
  { top:13, spd:38, w:65,  del:11 },
  { top:8,  spd:28, w:115, del:19 },
  { top:19, spd:45, w:55,  del:7  },
];

function PixelCloud({ w }: { w: number }) {
  const P = 5, cols = Math.floor(w/P), rows = 3;
  return (
    <svg width={cols*P} height={rows*P} style={{ imageRendering:"pixelated" }}>
      {Array.from({ length:rows }, (_,y) =>
        Array.from({ length:cols }, (_,x) => {
          const show = y===0 ? x>1 && x<cols-2 : true;
          return show ? <rect key={`${x}-${y}`} x={x*P} y={y*P} width={P} height={P} fill="rgba(255,255,255,0.82)"/> : null;
        })
      )}
    </svg>
  );
}

function PixelClouds() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:4, pointerEvents:"none", overflow:"hidden" }}>
      {CLOUDS.map((c,i) => (
        <div key={i} style={{
          position:"absolute", top:`${c.top}%`,
          animation:`cloudDrift ${c.spd}s linear infinite`,
          animationDelay:`-${c.del}s`,
        }}>
          <PixelCloud w={c.w}/>
        </div>
      ))}
    </div>
  );
}

// ─── 메인 에피소드 컴포넌트 ────────────────────────────────────────────────
export default function IpchunEpisode({
  onQuit, onNext,
}: { onQuit:()=>void; onNext:()=>void }) {

  const skyRef      = useRef<HTMLDivElement>(null);
  const vigRef      = useRef<HTMLDivElement>(null);
  const worldRef    = useRef<HTMLDivElement>(null);
  const groundRef   = useRef<HTMLDivElement>(null);
  const asphaltRef  = useRef<HTMLDivElement>(null);
  const glowFlwRef  = useRef<HTMLDivElement>(null);
  const blueGlwRef  = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("walk");

  useEffect(() => {
    let scrollX = 0;
    let cur: Phase = "walk";
    let discoverF = 0;
    let arriveF   = 0;
    let rafId     = 0;

    function updateBg(t: number) {
      if (skyRef.current) {
        skyRef.current.style.background =
          `linear-gradient(to bottom, ${lerpRGB(GRAY_TOP,BLUE_TOP,t)} 0%, ${lerpRGB(GRAY_BOT,BLUE_BOT,t)} 100%)`;
      }
      if (groundRef.current) {
        groundRef.current.style.background = lerpRGB(GRAY_GND, GREEN_GND, t);
      }
      if (asphaltRef.current)  asphaltRef.current.style.opacity  = String(1 - t);
      if (vigRef.current)       vigRef.current.style.opacity       = String(1 - Math.min(t*1.5, 1));
    }

    function frame() {
      if (cur === "walk") {
        scrollX += WALK_SPEED;

        // 꽃 가까워질수록 발광 강해짐
        if (scrollX >= GLOW_START && glowFlwRef.current) {
          const t = Math.min((scrollX - GLOW_START) / (FLOWER_X - GLOW_START), 1);
          const g = t * 28;
          glowFlwRef.current.style.filter =
            `drop-shadow(0 0 ${g}px rgba(253,224,71,.95)) ` +
            `drop-shadow(0 0 ${g*.7}px rgba(74,222,128,.85)) ` +
            `drop-shadow(0 0 ${g*.35}px rgba(253,224,71,.5))`;
        }

        if (scrollX >= FLOWER_X) {
          cur = "discover";
          setPhase("discover");
        }

      } else if (cur === "discover") {
        discoverF++;

        // 꽃 펄스 발광
        if (glowFlwRef.current) {
          const pulse = Math.sin(discoverF * 0.12) * 6;
          glowFlwRef.current.style.filter =
            `drop-shadow(0 0 ${36+pulse}px rgba(253,224,71,.99)) ` +
            `drop-shadow(0 0 ${26+pulse}px rgba(74,222,128,.95))`;
          glowFlwRef.current.style.transform = `scale(${1 + Math.sin(discoverF*.1)*.08})`;
        }

        if (discoverF >= 90) { // ~1.5초 후 달리기
          cur = "run";
          setPhase("run");
        }

      } else if (cur === "run") {
        scrollX += RUN_SPEED;
        const t = Math.min((scrollX - FLOWER_X) / TRANS_DIST, 1);
        updateBg(t);

        if (scrollX >= BLUE_X) {
          cur = "arrive";
          setPhase("arrive");
        }

      } else if (cur === "arrive") {
        const spd = Math.max(0.3, ARRIVE_SPEED - arriveF * 0.015);
        scrollX += spd;
        arriveF++;

        // 파란 꽃 펄스 발광
        if (blueGlwRef.current) {
          const pulse = Math.sin(arriveF * 0.09) * 9;
          blueGlwRef.current.style.filter =
            `drop-shadow(0 0 ${22+pulse}px rgba(96,165,250,.9)) ` +
            `drop-shadow(0 0 ${12+pulse}px rgba(147,197,253,.65))`;
        }

        if (arriveF >= 80) { // ~1.3초 후 다이얼로그
          cur = "dialog";
          setPhase("dialog");
          cancelAnimationFrame(rafId);
          return;
        }
      }

      // 월드 이동
      if (cur !== "dialog" && worldRef.current) {
        worldRef.current.style.transform = `translateX(${CHAR_X - scrollX}px)`;
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const charClass =
    phase === "run"     ? "pixel-run"   :
    phase === "walk"    ? "pixel-bob"   :
    "pixel-float";

  const charTilt =
    phase === "walk"    ? "rotate(4deg)"  :
    phase === "run"     ? "rotate(-5deg)" :
    "rotate(0deg)";

  const isBright = phase === "run" || phase === "arrive" || phase === "dialog";

  return (
    <div style={{ width:"100vw", height:"100vh", overflow:"hidden", position:"relative" }}>

      {/* 하늘 */}
      <div ref={skyRef} style={{
        position:"fixed", inset:0, zIndex:0,
        background:`linear-gradient(to bottom, rgb(60,60,70) 0%, rgb(105,105,115) 100%)`,
      }}/>

      {/* 픽셀 구름 (달리기 이후) */}
      {isBright && <PixelClouds/>}

      {/* 비네트 */}
      <div ref={vigRef} style={{
        position:"fixed", inset:0, zIndex:8, pointerEvents:"none",
        background:"radial-gradient(ellipse at 50% 65%, transparent 28%, rgba(0,0,0,.7) 100%)",
      }}/>

      {/* 바람 (달리기) */}
      {phase === "run" && <WindLines/>}

      {/* 반짝이 (달리기·도착) */}
      {(phase === "run" || phase === "arrive") && <SparkleLayer/>}

      {/* ── 스크롤 월드 ───────────────────────────────────── */}
      <div ref={worldRef} style={{
        position:"absolute", bottom:0, left:0,
        width:TOTAL_W, height:"100vh",
        transform:`translateX(${CHAR_X}px)`,
        willChange:"transform", zIndex:2,
      }}>
        {/* 지면 */}
        <div ref={groundRef} style={{
          position:"absolute", bottom:0, left:0, right:0,
          height:GROUND_H,
          background:"rgb(72,72,78)",
          borderTop:"2px solid rgba(255,255,255,.08)",
        }}/>

        {/* 아스팔트 텍스처 */}
        <div ref={asphaltRef} style={{
          position:"absolute", bottom:0, left:0, right:0,
          height:GROUND_H, pointerEvents:"none",
          backgroundImage:`
            repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 60px),
            repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0,rgba(255,255,255,.02) 1px,transparent 1px,transparent 22px)
          `,
        }}/>

        {/* 아스팔트 풀꽃 (발광) */}
        <div ref={glowFlwRef} style={{
          position:"absolute", left:FLOWER_X - 7, bottom:GROUND_H - 2,
          zIndex:5, transformOrigin:"bottom center",
        }}>
          <SmallFlower p={5}/>
        </div>

        {/* 봄 나무들 */}
        {TREES.map((t,i) => (
          <div key={i} style={{
            position:"absolute", left:t.x, bottom:GROUND_H,
            transform:"translateX(-50%)", zIndex:3,
          }}>
            <PixelTree p={t.p} light={t.light} dark={t.dark}/>
          </div>
        ))}

        {/* 봄 작은 꽃들 */}
        {SFWRS.map((f,i) => (
          <div key={i} style={{
            position:"absolute", left:f.x, bottom:GROUND_H - 1,
            animation:`floatNote ${2 + (i%3)*.4}s ease-in-out infinite`,
            animationDelay:`${i*.18}s`, zIndex:4,
          }}>
            <SmallFlower p={3}/>
          </div>
        ))}

        {/* 저 멀리 파란 꽃 */}
        <div style={{
          position:"absolute", left:BLUE_X, bottom:GROUND_H,
          transform:"translateX(-50%)", zIndex:5,
        }}>
          <BlueFinalFlower
            glowRef={blueGlwRef}
            onReady={() => setPhase("dialog")}
          />
        </div>
      </div>
      {/* ── /스크롤 월드 ──────────────────────────────────── */}

      {/* 캐릭터 (화면 고정) */}
      <div style={{
        position:"fixed", bottom:GROUND_H, left:CHAR_X,
        transform:"translateX(-50%)", zIndex:20,
      }}>
        {phase === "discover" && (
          <div style={{
            textAlign:"center", fontSize:24, fontWeight:900,
            color:"#fde68a", marginBottom:2,
            animation:"surprisePop .5s ease-out both",
          }}>！</div>
        )}
        <div style={{ transform:charTilt, transition:"transform .5s ease" }}>
          <PixelCharacter outfitIndex={0} className={charClass}/>
        </div>
      </div>

      {/* 다이얼로그 */}
      {phase === "dialog" && (
        <IpchunDialog onQuit={onQuit} onNext={onNext}/>
      )}
    </div>
  );
}
