const cat = document.getElementById("cat");

// 스프라이트 시트 레이아웃: 4열 × 2행 = 8 프레임 (3종 모두 동일)
const FRAME_COLS = 4;
const FRAME_ROWS = 2;
const TOTAL_FRAMES = FRAME_COLS * FRAME_ROWS;

const WALK_FRAME_MS = 130;
const IDLE_FRAME_MS = 360;
const WALK_SPEED = 1.0; // px per tick

const BLINK_DURATION_MS = 160;
const WALK_BLINK_INTERVAL = [2500, 5500];
const IDLE_BLINK_INTERVAL = [1500, 3500];

// 화면 하단 Dock 위 정도의 Y 좌표 (정확한 Dock 좌표는 시스템마다 달라서 추정값)
const CAT_SIZE = 96;
const DOCK_AVOID = 92;
let groundY = window.innerHeight - DOCK_AVOID - CAT_SIZE * 0.3;

let x = window.innerWidth * 0.5;
cat.style.top = groundY + "px";
cat.style.left = x + "px";

let mode = "walk"; // "walk" | "idle"
let direction = Math.random() < 0.5 ? -1 : 1;
let frame = 0;
let lastFrameAt = 0;
let nextDecisionAt = performance.now() + rand(4000, 9000);
let idleUntil = 0;
let nextBlinkAt = performance.now() + rand(...WALK_BLINK_INTERVAL);
let blinkClearAt = 0;
let blinking = false;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function updateFacing() {
  cat.classList.toggle("facing-left", direction < 0);
}

function applyMode(next) {
  if (mode === next) return;
  mode = next;
  cat.classList.toggle("walk", mode === "walk");
  cat.classList.toggle("idle", mode === "idle");
  frame = 0;
  setFrame(0);
  nextBlinkAt =
    performance.now() +
    rand(
      ...(mode === "idle" ? IDLE_BLINK_INTERVAL : WALK_BLINK_INTERVAL)
    );
}

function setFrame(idx) {
  const col = idx % FRAME_COLS;
  const row = Math.floor(idx / FRAME_COLS);
  const xPct = (col / (FRAME_COLS - 1)) * 100;
  const yPct = (row / (FRAME_ROWS - 1)) * 100;
  cat.style.backgroundPosition = `${xPct}% ${yPct}%`;
}

function triggerBlink(now) {
  cat.classList.add("blink");
  blinking = true;
  blinkClearAt = now + BLINK_DURATION_MS;
  nextBlinkAt =
    now +
    rand(
      ...(mode === "idle" ? IDLE_BLINK_INTERVAL : WALK_BLINK_INTERVAL)
    );
}

function clearBlink() {
  cat.classList.remove("blink");
  blinking = false;
}

function tick(now) {
  if (mode === "walk") {
    x += direction * WALK_SPEED;

    if (x < 10) {
      x = 10;
      direction = 1;
      updateFacing();
    } else if (x > window.innerWidth - CAT_SIZE - 10) {
      x = window.innerWidth - CAT_SIZE - 10;
      direction = -1;
      updateFacing();
    }
    cat.style.left = x + "px";

    if (now - lastFrameAt > WALK_FRAME_MS) {
      frame = (frame + 1) % TOTAL_FRAMES;
      setFrame(frame);
      lastFrameAt = now;
    }

    if (now > nextDecisionAt) {
      const r = Math.random();
      if (r < 0.4) {
        applyMode("idle");
        idleUntil = now + rand(3000, 7000);
      } else if (r < 0.7) {
        direction *= -1;
        updateFacing();
      }
      nextDecisionAt = now + rand(4000, 9000);
    }
  } else if (mode === "idle") {
    if (now - lastFrameAt > IDLE_FRAME_MS) {
      frame = (frame + 1) % TOTAL_FRAMES;
      setFrame(frame);
      lastFrameAt = now;
    }

    if (now > idleUntil) {
      applyMode("walk");
      nextDecisionAt = now + rand(4000, 9000);
    }
  }

  // 깜빡임 — 모드 무관하게 처리
  if (!blinking && now > nextBlinkAt) {
    triggerBlink(now);
  } else if (blinking && now > blinkClearAt) {
    clearBlink();
  }

  requestAnimationFrame(tick);
}

window.addEventListener("resize", () => {
  groundY = window.innerHeight - DOCK_AVOID - CAT_SIZE * 0.3;
  cat.style.top = groundY + "px";
  if (x > window.innerWidth - CAT_SIZE - 10) {
    x = window.innerWidth - CAT_SIZE - 10;
    cat.style.left = x + "px";
  }
});

updateFacing();
applyMode("walk");
requestAnimationFrame(tick);
