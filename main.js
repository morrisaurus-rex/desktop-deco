// main.js
'use-strict'

const { app, Tray, Menu } = require('electron');
const os = require('os');
const isWin32 = os.platform() === 'win32';

// Just in case we want to implement features that require native binaries
var nativeaddon = null;
if (isWin32) {
    nativeaddon = require('bindings')('win32lib');
}

// Pages split into their own JS files
const Settings = require('./SettingsWindow.js');
const WidgetLayer = require('./WidgetLayer.js');

// IPC protocol
const IpcManager = require('./IpcManager.js');

// Global handles
let ipcManager = null;
let homePage = null;
let appIcon = null;
let widgetLayer = null;

function raiseNotReady() {
    return new Exception("App not ready");
}

function createTrayMenu() {
    let tray  = new Tray('./assets/appicon.png');
    const cxtMenu = Menu.buildFromTemplate([
        {
            label: "Quit",
            role: 'quit'
        },
        {
            label: "Settings",
            click: (menuitem, browserWindow, event) => {
                if (browserWindow == homePage) return;
                homePage.show();
            }
        },
        {
            label: "Load Decorations"
        },
        {
            label: "Widget Dev Tools",
            click: (menuitem, browserWindow, event) => {
                if (widgetLayer.webContents.isDevToolsOpened()) {
                    widgetLayer.webContents.closeDevTools()
                } else {
                    widgetLayer.webContents.openDevTools({mode: 'detach'});
                }
            }
        }
    ]);
    tray.setContextMenu(cxtMenu);
    tray.setToolTip("Desktop Deco");
    return tray;
}

// Needed since we change default close behaviour of the settings page
app.on('before-quit', () => {
    homePage.close();
    homePage.destroy();
    widgetLayer.close();
    widgetLayer.destroy();
})

app.whenReady().then(()=>{
    appIcon = createTrayMenu();
    homePage = Settings.createSettingsPage();
    widgetLayer = WidgetLayer.createWidgetLayer();
    ipcManager = new IpcManager.IpcManager(widgetLayer, homePage);
});
