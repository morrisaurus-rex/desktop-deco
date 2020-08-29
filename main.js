// main.js
'use-strict'

const { app, Tray, Menu } = require('electron');
const os = require('os');
const isWin32 = os.platform() === 'win32';
let path = require('path'), fs = require('fs');

// Just in case we want to implement features that require native binaries
let nativeaddon = null;
if (isWin32) {
    nativeaddon = require('bindings')('win32lib');
}

// Pages split into their own JS files
const Settings = require('./SettingsWindow.js');
const WidgetManager = require('./WidgetManager.js');

// IPC protocol
const IpcManager = require('./IpcManager.js');

// Global handles
let ipcManager = null;
let homePage = null;
let appIcon = null;
let widgetManager = null;

// File for storing user config data
let userDataFile = path.join(app.getPath("userData"), 'config.json');

// Enforce single instance
if (!app.requestSingleInstanceLock()) app.exit();
else {
    if (homePage !== null) {
        homePage.focus();
    }
}

// Callback for runConfigurationCheck()
function processConfig(err, stat) {
    if (err) {
        // Load the default widget here
    } else {
        fs.readFile(configpath, 'utf16', loadFromConfig);
    }
}
// Callback for processConfig
function loadFromConfig(err, data) {
    if (err) {
        console.log(`Problem with fs.readFile() on config file: ${err.message}`);
    } else {
        let configData = JSON.parse(data);
        let widgetsToLoad = configData["savedLayouts"][configData["currentLayout"]];

        if (!widgetsToLoad) {
            // TODO: let the user know currentLayout is not registered to savedLayouts
            configData["currentLayout"] = "";
            writeConfigFile(configData);
        }
        
        for (let a = 0; a < widgetsToLoad.length; a++) {

            // Reminder that this throws if file extension is not html or if 
            widgetManager.addWidget(configData[
        }
    }
}
// Write to the user configuration file;
function writeConfigFile(configObj) {
    fs.writeFile(userDataFile, JSON.stringify(configObj), 'utf16', (err) => {
        throw err;
    });
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
                console.log('Widget Dev Tools clicked');
            }
        }
    ]);
    tray.setContextMenu(cxtMenu);
    tray.setToolTip("Desktop Deco");
    return tray;
}

function Initialize() {
    appIcon = createTrayMenu();
    widgetManager = new WidgetManager.WidgetManager();
    homePage = Settings.createSettingsPage();
    fs.stat(userDataFile, null, processConfig);
}

// Needed since we change default close behaviour of the settings page
app.on('before-quit', () => {
    homePage.close();
    homePage.destroy();
    widgetManager.unloadAll();
})


app.whenReady().then(Initialize);

// TODO: Change startup to load Layouts instead of the widgetLayer