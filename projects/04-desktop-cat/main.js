const { app, BrowserWindow, screen } = require("electron");

let win;

function createWindow() {
  const primary = screen.getPrimaryDisplay();
  const { width, height } = primary.bounds;

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
    focusable: false,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
    },
  });

  // 클릭이 아래 앱으로 통과되도록 (고양이가 작업 방해 X)
  win.setIgnoreMouseEvents(true);

  // 다른 앱·전체화면 위에도 떠 있도록
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
