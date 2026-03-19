const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "LYRA Admin Portal",
    icon: path.join(__dirname, 'LyraEsportsLogo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#000000'
  });

  // Remove menu bar for a cleaner look
  win.setMenuBarVisibility(false);

  // Load the login page
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
