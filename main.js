// main.js
'use-strict'

const { app, BrowserWindow, Tray, Menu } = require('electron');
const electron = require('electron');

const os = require('os');
const isWin32 = os.platform() === 'win32';
var nativeaddon = null;
if (isWin32) {
    nativeaddon = require('bindings')('win32lib');
}

var appIcon = null;

function raiseNotReady() {
    return new Exception("App not ready");
}

function createTrayMenu() {
    appIcon  = new Tray('./assets/appicon.png');
    const cxtMenu = Menu.buildFromTemplate([
        {
            label: "Quit",
            role: "quit"
        },
        {
            label: "Settings"
        },
        {
            label: "Load Desktop..."
        },
        {
            label: "Dev",
            role: "toggleDevTools"
        }
    ]);
    appIcon.setContextMenu(cxtMenu);
    appIcon.setTitle("Desktop Deco")
}

function loadDeco(filepath) {
    if (!app.isReady()) {
        return raiseNotReady();
    }
    else {
        let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
        let windowProps = {
            frame: false,
            transparent: true,
            width,
            height,
            focusable: true,
            resizable: false,
            type: (isWin32) ? 'normal': 'desktop',
            webPreferences: {
                nodeIntegration: true
            }
        }

        let mainWindow = new BrowserWindow(windowProps);
        // mainWindow.setIgnoreMouseEvents(true);
        console.log(`Loading file: ${filepath}`)
        mainWindow.loadFile(filepath);
        mainWindow.show();
/* 
        if (isWin32) {
            nativeaddon.setBottomMost(mainWindow.getNativeWindowHandle());
        } */

        let appTray = createTrayMenu();
    }
}

app.whenReady().then(()=>{loadDeco('./ui/test-overlay.html')})