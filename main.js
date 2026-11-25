// Birth Face: one window, the page in app/. Profiles and observations are kept in the page's own storage, which
// Electron keeps on this computer between runs.
const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
function create() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 900, minHeight: 640, backgroundColor: "#1f2547", title: "Birth Face",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file:")) e.preventDefault(); });
  win.loadFile(path.join(__dirname, "app", "index.html"));
}
app.whenReady().then(create);
app.on("window-all-closed", () => app.quit());
