/*
main.js
Initialize the application:
- Check for single instance
- Load saved configuration if available
- Determine initial state of application
- Establish user settings page
*/
'use-strict'

// Electron modules
const { app, Tray, Menu, BrowserWindow } = require('electron');
// Standard modules
const path = require('path'), fs = require('fs');
const platform = require('os').platform();

// Just in case we want to implement features that require native binaries
let nativeaddon = null;
if (platform == 'win32') nativeaddon = require('./build/Release/win32.node');

// Internal Modules
const Manager = require('./App.js');

// IPC protocol
const IpcProtocol = require('./IpcProtocol.js');

// Program constants
// -- File for storing application settings between sessions
const APP_CONFIG = path.join(app.getPath('userData'), 'config.json');
// individual items
let settings;
// Tray menu
let appIcon;

// Enforce single instance
if (!app.requestSingleInstanceLock()) app.quit();
else {
    if (homePage !== null) {
        homePage.focus();
    }
}

/**
 * Creates the app's tray menu
 * @returns The Electron {@link Tray} object.
 */
function createTrayMenu() {
    let tray  = new Tray('./assets/appicon.png');
    const cxtMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            role: 'quit'
        },
        {
            label: 'Settings',
            click: (menuitem, browserWindow, event) => {
                if (browserWindow == homePage) return;
                homePage.show();
            }
        },
        {
            label: 'Widget Dev Tools',
            click: (menuitem, browserWindow, event) => {
                console.log('Widget Dev Tools clicked');
            }
        }
    ]);
    tray.setContextMenu(cxtMenu);
    tray.setToolTip('Desktop Deco');
    return tray;
}

// Initialize the application's services
function Initialize() {
    let configuration = loadConfig();
    widgetManager = new WidgetManager(configuration);
    let ipcMain = require('electron').ipcMain;
    for (let handler of IpcProtocol.IpcList) ipcMain.on(handler.eventName, handler.eventHandler.bind(widgetManager));

    homePage = new BrowserWindow({
        width: 500,
        height: 700,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        devTools: true,
        center: true
    });
    homePage.loadFile('./ui/SettingsWindow.html');
    appIcon = createTrayMenu();
}

// Testing version
function TestInitialize() {
    widgetManager = newWidgetManager();
    let ipcMain = require('electron').ipcMain;
    for (lethandler of IpcProtocol.IpcList) ipcMain.on(handler.eventName, handler.eventHandler.bind(wdigetManager));
}

// Parses the configuration file, if no file is present then one is created
function loadConfig() {
    try {
        let configData = fs.readFileSync(APP_CONFIG, {encoding: 'utf8'});
        return JSON.parse(configData);
    } catch (e) {
        fs.writeFile(APP_CONFIG, JSON.stringify(DEFAULT_CONFIG), saveError.bind(null, APP_CONFIG));
        return DEFAULT_CONFIG;
    }
}

// Called when writeFile throws
function saveError(path, err) {
    console.log('Could not create config file');
}
 
app.on('before-quit', () => {
    widgetManager.unloadAll();
    fs.unlink(APP_CONFIG);
});

// Needed since we change default close behaviour of the settings page
app.on('quit', () => {

    console.log('cleanup finished');
})


app.whenReady().then(Initialize);