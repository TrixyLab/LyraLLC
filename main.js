const { app, BrowserWindow } = require('electron');
const path = require('path');

const ALLOWED_HTML_PATHS = new Set([
  path.join(__dirname, 'login.html'),
  path.join(__dirname, 'create-password.html'),
  ...[
    'admin-access.html',
    'admin-chat.html',
    'admin-dashboard.html',
    'admin-dms.html',
    'admin-meetings.html',
    'admin-news.html',
    'admin-orders.html',
    'admin-overview.html',
    'admin-reviews.html',
    'admin-roster.html',
    'admin-settings.html'
  ].map(file => path.join(__dirname, 'adminFiles', file))
]);

function isAllowedLocalRoute(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'file:') return false;
    const normalizedPath = path.normalize(decodeURIComponent(parsed.pathname));
    return ALLOWED_HTML_PATHS.has(normalizedPath);
  } catch {
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'LYRA Admin Portal',
    icon: path.join(__dirname, 'LyraEsportsLogo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#000000'
  });

  win.setMenuBarVisibility(false);

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  win.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedLocalRoute(url)) {
      event.preventDefault();
    }
  });

  win.webContents.on('will-redirect', (event, url) => {
    if (!isAllowedLocalRoute(url)) {
      event.preventDefault();
    }
  });

  win.webContents.on('new-window', event => {
    event.preventDefault();
  });


  win.loadFile('login.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
