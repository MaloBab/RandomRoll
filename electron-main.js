import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let win = null


function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 770,
    minWidth: 1100,
    minHeight: 770,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

  console.log('======== Electron DEBUG ========')
  console.log('App is packaged:', app.isPackaged)
  console.log('Dev server URL:', devServerUrl)
  console.log('================================')


  win.on('closed', () => {
    win = null
  })
}

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

