// Opens the packaged page in Electron, adds a person, waits for the face, and reports.
const { app, BrowserWindow } = require("electron");
const path = require("path");
app.whenReady().then(async () => {
  const w = new BrowserWindow({ show: false, width: 1280, height: 860, webPreferences: { contextIsolation: true, sandbox: true } });
  await w.loadFile(path.join(__dirname, "..", "app", "index.html"));
  const r = await w.webContents.executeJavaScript(`(async () => {
    localStorage.clear(); document.getElementById('first').click(); const f=document.getElementById('pf');
    f.name.value='Test'; f.date.value='1990-04-03'; f.time.value='09:00'; f.place.value='London'; f.place.dispatchEvent(new Event('input'));
    document.querySelector('#pf-sugg li[data-i]').click(); f.requestSubmit();
    const t0=Date.now(); while(Date.now()-t0<30000){ if(!document.querySelector('.face .wait')) break; await new Promise(r=>setTimeout(r,200)); }
    const c=document.querySelector('#face canvas'); return { drawn: !document.querySelector('.face .wait') && c.width===450, ms: Date.now()-t0, sub: document.querySelector('.sub').textContent };
  })()`);
  console.log(JSON.stringify(r)); app.exit(r.drawn ? 0 : 1);
});
