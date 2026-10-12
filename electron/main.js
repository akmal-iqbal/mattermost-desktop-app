const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require("electron");
const path = require("path");

// Remove default window menu (File, Edit, View, Window, Help)
Menu.setApplicationMenu(null);

let mainWindow;

// Custom tab-strip window controls (frameless look, same as screenshot)
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on("window-close", () => mainWindow?.close());
ipcMain.handle("window-is-maximized", () => mainWindow?.isMaximized() ?? false);

// React app-menu (3-dot button): File / Edit / View / History / Window / Help
ipcMain.on("menu-action", (_e, menu, action) => {
  const wc = mainWindow?.webContents;
  try {
    if (menu === "file") {
      if (action === "newWindow") createWindow();
      else if (action === "closeWindow") mainWindow?.close();
      else if (action === "quit") app.quit();
    } else if (menu === "edit") {
      if (
        wc &&
        ["undo", "redo", "cut", "copy", "paste", "selectAll", "delete"].includes(action) &&
        typeof wc[action] === "function"
      ) {
        wc[action]();
      }
    } else if (menu === "view") {
      if (!mainWindow || !wc) return;
      if (action === "reload") wc.reload();
      else if (action === "forceReload") wc.reloadIgnoringCache();
      else if (action === "toggleDevTools") wc.toggleDevTools();
      else if (action === "zoomIn") wc.setZoomLevel(wc.getZoomLevel() + 0.5);
      else if (action === "zoomOut") wc.setZoomLevel(wc.getZoomLevel() - 0.5);
      else if (action === "zoomReset") wc.setZoomLevel(0);
      else if (action === "toggleFullscreen")
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    } else if (menu === "history") {
      if (!wc) return;
      const nav = wc.navigationHistory ?? wc;
      if (action === "back" && nav.canGoBack()) nav.goBack();
      else if (action === "forward" && nav.canGoForward()) nav.goForward();
    } else if (menu === "window") {
      if (!mainWindow) return;
      if (action === "front") {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    } else if (menu === "help") {
      if (action === "docs") shell.openExternal("https://docs.mattermost.com/");
      else if (action === "about")
        dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "About",
          message: "Mattermost Desktop",
          detail: `Version ${app.getVersion()}\nFree Edition — team communication, reimagined.`,
          buttons: ["OK"],
        });
    }
  } catch {
    /* ignore menu errors */
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 560,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Extra safety: hide menu on Windows/Linux
  mainWindow.setMenuBarVisibility(false);

  // Keep React topbar maximize/restore icon in sync (even for Win+arrows etc.)
  mainWindow.on("maximize", () =>
    mainWindow.webContents.send("window-maximized-change", true),
  );
  mainWindow.on("unmaximize", () =>
    mainWindow.webContents.send("window-maximized-change", false),
  );

  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173").catch(() => {});
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../dist/index.html")
    );
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});