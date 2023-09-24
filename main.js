const {app, BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
require('@electron/remote/main').initialize()
const Store = require('electron-store')
// 初始化
Store.initRenderer();
const path = require('path')
let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  require('@electron/remote/main').enable(mainWindow.webContents)
  const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'
  mainWindow.loadURL(urlLocation)
})
