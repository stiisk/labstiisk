const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let fireworksWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools only in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Function to update the window title
  ipcMain.on('update-title', (event, title) => {
    mainWindow.setTitle(title);
  });

  ipcMain.on('show-fireworks', () => {
    createFireworksWindow();
  });
};

const createFireworksWindow = () => {
  if (fireworksWindow) {
    fireworksWindow.close();
  }

  fireworksWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  fireworksWindow.loadFile(path.join(__dirname, 'fireworks.html'));

  fireworksWindow.on('closed', () => {
    fireworksWindow = null;
  });

  setTimeout(() => {
    if (fireworksWindow) {
      fireworksWindow.close();
    }
  }, 5000); // Close after 5 seconds
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
