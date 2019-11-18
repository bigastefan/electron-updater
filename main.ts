import { app, BrowserWindow, screen, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { autoUpdater } from 'electron-updater';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function sendMessage(msg: string) {
  console.log('message sent !');
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg); // prints "ping"
    event.reply('asynchronous-reply', msg);
  });
}

autoUpdater.setFeedURL('https://github.com/bigastefan/electron-updater');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();
    autoUpdater.checkForUpdates();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  autoUpdater.on('error', message => {
    console.error('There was a problem updating the application');
    console.error(message);
  });

} catch (e) {
  // Catch Error
  // throw e;
}

autoUpdater.on('checking-for-update', () => {
  sendMessage('Checking for update...');
});

autoUpdater.on('update-available', (ev, info) => {
  sendMessage('Update available.');
});
autoUpdater.on('update-not-available', (ev, info) => {
  sendMessage('Update not available.');
});
autoUpdater.on('error', (ev, err) => {
  sendMessage('Error in auto-updater.');
  console.log(err);
  sendMessage(err);
});
autoUpdater.on('download-progress', (ev, progressObj) => {
  sendMessage('Download progress...');
});
autoUpdater.on('update-downloaded', (ev, info) => {
  sendMessage('Update downloaded; will install in 5 seconds');
});
