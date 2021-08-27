// import { app, BrowserWindow } from 'electron';
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

const preload = path.join(__dirname, 'preload.js');
console.log({ preload });

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    vibrancy: 'under-window',
    visualEffectState: 'followWindow',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      // SN: Allow renderer to read files from computer in dev mode by disabling security.
      // SN: This is automatically resolved in Mac DMG as that asks for FS access from user.
      // webSecurity: isDev ? false : true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // "main": "src/background/main.js",
  // "homepage": "./",
  // "build": {
  //   "appId": "com.electron.example-app",
  //   "mac": {
  //     "target": [
  //       "dmg",
  //       "zip"
  //     ]
  //   },
  //   "files": [
  //     "**/*",
  //     "build/**/*"
  //   ],
  //   "extraMetadata": {
  //     "main": "src/background/main.js"
  //   },
  //   "extends": null
  // },

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../../build/index.html')}`
  );
}

/* ================================================================ */
/* ================================================================ */

const { ipcMain } = require('electron');
ipcMain.on('test', (event, payload) => {
  console.log('test!!!', payload);
  event.reply('test', { from: 'main.js' });
});

/* ================================================================ */
/* ================================================================ */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // SN: No need to intercept file protocol with web security enabled?
  // if (isDev) {
  //   protocol.interceptFileProtocol('file', (request, callback) => {
  //     const pathname = decodeURIComponent(request.url.replace('file:///', ''));
  //     callback(pathname);
  //   });
  // }

  protocol.registerFileProtocol('file-protocol', (request, callback) => {
    const url = decodeURIComponent(
      request.url.replace('file-protocol://getMediaFile/', '')
    );
    callback(url);
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
