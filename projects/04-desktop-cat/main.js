const { app, BrowserWindow, screen } = require("electron");
const path = require("path");

let win;

function computeDockArea(display) {
  const b = display.bounds;
  const w = display.workArea;
  // 화면 좌표 → 윈도우 로컬 좌표 (윈도우가 bounds 전체를 덮으므로 - b.x, b.y)
  const dockTop = w.y + w.height - b.y;
  const dockBottom = b.height;
  const dockHeight = dockBottom - dockTop;
  return { dockTop, dockHeight };
}

function createWindow() {
  const primary = screen.getPrimaryDisplay();
  const { width, height } = primary.bounds;
  const { dockTop, dockHeight } = computeDockArea(primary);

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.setIgnoreMouseEvents(true);
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.loadFile(path.join(__dirname, "index.html"), {
    query: {
      dockTop: String(dockTop),
      dockHeight: String(dockHeight),
    },
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
