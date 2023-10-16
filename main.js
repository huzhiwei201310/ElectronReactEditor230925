const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
require('@electron/remote/main').initialize()
const Store = require('electron-store')
const AppWindow = require('./src/AppWindow')
// 初始化
Store.initRenderer();
const path = require('path')
let mainWindow, settingsWindow;

app.whenReady().then(() => {
  const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`
  mainWindow = new AppWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: true,
      contextIsolation: false
    }
  }, urlLocation)
  require('@electron/remote/main').enable(mainWindow.webContents)
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  ipcMain.on('open-settings-window', () => {
    mainWindow.webContents.send('open-settings-window')
  })

  // mainWindow.loadURL(urlLocation)
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})
