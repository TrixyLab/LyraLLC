const { app, BrowserWindow, shell, session, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "LYRA Admin Portal",
    icon: path.join(__dirname, 'LyraEsportsLogo.png'),
    frame: false, // Frameless for custom title bar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#000000'
  });

  // 1. Force WebRTC Media Device Access
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'display-capture', 'notifications'];
    if (allowed.includes(permission)) return callback(true);
    callback(false);
  });
  
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'media' || permission === 'display-capture') return true;
    return false;
  });

  // 2. Fix Screensharing (Desktop Capturer Handler)
  // This bypasses the need for a renderer-side picker by picking the first screen/window
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      // Prioritize the entire screen (usually what's wanted)
      const primarySource = sources.find(s => s.name === 'Entire Screen' || s.id.startsWith('screen')) || sources[0];
      callback({ video: primarySource, audio: 'loopback' });
    });
  });

  // 3. IPC Main Handlers for Custom Title Bar
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('window-close', () => win.close());

  // 4. Network Sandboxing
  win.webContents.on('will-navigate', (event, url) => {
     if (url.startsWith('http://') || url.startsWith('https://')) {
       event.preventDefault();
       shell.openExternal(url);
       return;
     }
     const blockedPages = ['index.html', 'apply.html', 'about.html', 'invest.html', 'shop.html', 'teams.html', 'partners.html', 'management.html', 'vision.html'];
     if (blockedPages.some(page => url.includes(page))) {
       event.preventDefault();
     }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
     if (url.startsWith('http')) shell.openExternal(url);
     return { action: 'deny' };
  });

  // 5. Inject Custom Title Bar & CSS Surgeries
  win.webContents.on('dom-ready', () => {
    win.focus(); // Ensure keyboard focus
    
    // Inject Title Bar HTML and CSS
    win.webContents.insertCSS(`
      #lyra-title-bar {
        position: fixed; top: 0; left: 0; width: 100%; height: 38px;
        background: rgba(13, 13, 13, 0.95); backdrop-filter: blur(10px); color: #fff; 
        display: flex; align-items: center; justify-content: space-between; 
        z-index: 999999; -webkit-app-region: drag;
        border-bottom: 1px solid rgba(255,255,255,0.08); user-select: none;
        font-family: 'Barlow Condensed', sans-serif; padding: 0 0 0 15px;
      }
      .title-controls { display: flex; -webkit-app-region: no-drag; height: 100%; }
      .control-btn {
        width: 48px; height: 38px; display: flex; align-items: center;
        justify-content: center; cursor: pointer; transition: all 0.2s;
        color: #888;
      }
      .control-btn svg { width: 10px; height: 10px; fill: currentColor; }
      .control-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .control-btn.close:hover { background: #E8002D; color: #fff; }
      
      /* Offset content for the title bar */
      body { padding-top: 38px !important; }
      .sidebar { top: 38px !important; height: calc(100vh - 38px) !important; }
      #dashboard-overlay-iframe, #meet-container { top: 38px !important; height: calc(100vh - 38px) !important; }

      /* Surgical UI cleanup */
      a.back-home, .login-footer p:first-child { display: none !important; }
    `);

    win.webContents.executeJavaScript(`
      if (!document.getElementById('lyra-title-bar')) {
        const bar = document.createElement('div');
        bar.id = 'lyra-title-bar';
        bar.innerHTML = \`
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="../LyraEsportsLogo.png" style="height:18px; width:auto; filter: drop-shadow(0 0 5px rgba(232,0,45,0.3));">
            <div style="display:flex; flex-direction:column; justify-content:center; line-height:1;">
               <span style="font-weight:800; letter-spacing:0.15em; font-size:0.75rem; text-transform:uppercase; color:#E8002D;">LYRA <span style="color:#fff;">PORTAL</span></span>
               <span style="font-size:0.5rem; color:#666; font-weight:700; letter-spacing:0.1em; margin-top:2px;">SECURE ADMIN v1.0.4</span>
            </div>
          </div>
          <div class="title-controls">
            <div class="control-btn" onclick="window.electronAPI.minimize()">
               <svg viewBox="0 0 10 10"><path d="M0 4h10v1H0z"/></svg>
            </div>
            <div class="control-btn" onclick="window.electronAPI.maximize()">
               <svg viewBox="0 0 10 10"><path d="M1 1v8h8V1H1zm7 7H2V2h6v6z"/></svg>
            </div>
            <div class="control-btn close" onclick="window.electronAPI.close()">
               <svg viewBox="0 0 10 10"><path d="M1 1l8 8m0-8L1 9"/></svg>
            </div>
          </div>
        \`;
        document.body.prepend(bar);
      }
    `);
  });

  win.loadFile('login.html');
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
