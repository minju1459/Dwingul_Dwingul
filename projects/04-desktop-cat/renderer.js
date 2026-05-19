const cat = document.getElementById("cat");

const TARGET_HEIGHT = 100; // 화면에서 고양이 키 (px)
const WALK_SPEED = 0.9;
const IDLE_DURATION_MS = 3000;
const BLINK_DURATION_MS = 160;
const WALK_BLINK_INTERVAL = [2500, 5500];
const IDLE_BLINK_INTERVAL = [1500, 3500];

// === Dock 위치 — main.js에서 query로 전달 ===
const urlParams = new URLSearchParams(window.location.search);
const dockTop = parseFloat(urlParams.get("dockTop") || "0") || 0;

let x = window.innerWidth * 0.5;
let direction = Math.random() < 0.5 ? -1 : 1;
let mode = "walk";
let nextDecisionAt = performance.now() + rand(4000, 9000);
let idleUntil = 0;
let nextBlinkAt = performance.now() + rand(...WALK_BLINK_INTERVAL);
let blinkClearAt = 0;
let blinking = false;

const sprites = { walk: null, idle: null, blink: null };
let catDisplayW = TARGET_HEIGHT;
let catDisplayH = TARGET_HEIGHT;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// PNG가 알파 없이 체커 패턴(회색 ~203/~207)을 배경으로 가지고 있는 경우 대비
// — 그 두 회색 톤을 투명으로 만든 뒤, 불투명 bounding box를 찾는다.
function stripCheckerAndCrop(img) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // 체커 픽셀 후보: R=G=B (그레이스케일), 195~225 범위
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const isGray = Math.abs(r - g) < 4 && Math.abs(g - b) < 4;
    if (isGray && r >= 195 && r <= 225) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // bounding box
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] > 30) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cw = Math.max(1, maxX - minX + 1);
  const ch = Math.max(1, maxY - minY + 1);
  return { canvas: c, bbox: { x: minX, y: minY, w: cw, h: ch } };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// 3장의 cat 이미지를 다 잘라서, 셋 중 가장 큰 bbox 크기에 맞춰 공통 캔버스로 정렬 (바닥 기준)
async function loadAndAlign() {
  const [walkImg, idleImg, blinkImg] = await Promise.all([
    loadImage("assets/cat-walk.png"),
    loadImage("assets/cat-idle.png"),
    loadImage("assets/cat-idle-blink.png"),
  ]);

  const a = stripCheckerAndCrop(walkImg);
  const b = stripCheckerAndCrop(idleImg);
  const c = stripCheckerAndCrop(blinkImg);

  const maxW = Math.max(a.bbox.w, b.bbox.w, c.bbox.w);
  const maxH = Math.max(a.bbox.h, b.bbox.h, c.bbox.h);

  function repack(src) {
    const out = document.createElement("canvas");
    out.width = maxW;
    out.height = maxH;
    const octx = out.getContext("2d");
    // 가로 가운데, 세로 바닥 정렬
    const drawX = (maxW - src.bbox.w) / 2;
    const drawY = maxH - src.bbox.h;
    octx.drawImage(
      src.canvas,
      src.bbox.x, src.bbox.y, src.bbox.w, src.bbox.h,
      drawX, drawY, src.bbox.w, src.bbox.h
    );
    return out.toDataURL();
  }

  sprites.walk = repack(a);
  sprites.idle = repack(b);
  sprites.blink = repack(c);

  // 화면 표시 크기 계산 (TARGET_HEIGHT 기준 비율 유지)
  const ratio = maxW / maxH;
  catDisplayH = TARGET_HEIGHT;
  catDisplayW = Math.round(TARGET_HEIGHT * ratio);

  cat.style.width = catDisplayW + "px";
  cat.style.height = catDisplayH + "px";

  // Dock 위에 정확히 — 고양이 바닥이 Dock 윗선과 일치
  const groundY = dockTop - catDisplayH;
  cat.style.top = groundY + "px";

  setSpriteBg("walk");
  cat.style.left = x + "px";
}

function setSpriteBg(key) {
  if (sprites[key]) cat.style.backgroundImage = `url(${sprites[key]})`;
}

function updateFacing() {
  cat.classList.toggle("facing-left", direction < 0);
}

function applyMode(next) {
  if (mode === next) return;
  mode = next;
  setSpriteBg(mode === "idle" ? "idle" : "walk");
  nextBlinkAt =
    performance.now() +
    rand(...(mode === "idle" ? IDLE_BLINK_INTERVAL : WALK_BLINK_INTERVAL));
}

function triggerBlink(now) {
  setSpriteBg("blink");
  blinking = true;
  blinkClearAt = now + BLINK_DURATION_MS;
  nextBlinkAt =
    now +
    rand(...(mode === "idle" ? IDLE_BLINK_INTERVAL : WALK_BLINK_INTERVAL));
}

function clearBlink() {
  setSpriteBg(mode === "idle" ? "idle" : "walk");
  blinking = false;
}

function tick(now) {
  if (mode === "walk") {
    x += direction * WALK_SPEED;

    if (x < 10) {
      x = 10;
      direction = 1;
      updateFacing();
    } else if (x > window.innerWidth - catDisplayW - 10) {
      x = window.innerWidth - catDisplayW - 10;
      direction = -1;
      updateFacing();
    }
    cat.style.left = x + "px";

    if (now > nextDecisionAt) {
      const r = Math.random();
      if (r < 0.4) {
        applyMode("idle");
        idleUntil = now + IDLE_DURATION_MS;
      } else if (r < 0.65) {
        direction *= -1;
        updateFacing();
      }
      nextDecisionAt = now + rand(5000, 10000);
    }
  } else if (mode === "idle") {
    if (now > idleUntil) {
      applyMode("walk");
      nextDecisionAt = now + rand(5000, 10000);
    }
  }

  if (!blinking && now > nextBlinkAt) {
    triggerBlink(now);
  } else if (blinking && now > blinkClearAt) {
    clearBlink();
  }

  requestAnimationFrame(tick);
}

updateFacing();
loadAndAlign().then(() => {
  requestAnimationFrame(tick);
});
