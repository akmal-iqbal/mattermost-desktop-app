const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (message) => {
    ipcRenderer.send("send-message", message);
  },
  // Custom tab-strip window controls (frameless window)
  windowMinimize: () => ipcRenderer.send("window-minimize"),
  windowMaximize: () => ipcRenderer.send("window-maximize"),
  windowClose: () => ipcRenderer.send("window-close"),
  windowIsMaximized: () => ipcRenderer.invoke("window-is-maximized"),
  // React app-menu (3-dot button): menu-action -> main process
  menuAction: (menu, action) => ipcRenderer.send("menu-action", menu, action),  onMaximizedChange: (cb) => {
    const listener = (_e, v) => cb(v);
    ipcRenderer.on("window-maximized-change", listener);
    return () => ipcRenderer.removeListener("window-maximized-change", listener);
  },
  noop: () => {},
});
