const { ipcMain, BrowserWindow, dialog, app } = require('electron');

// List of all ipcRenderer messages to listen for
// IpcManager instances will rebind 'this' on construct
'use-strict'

const listeners = [
    {
        eventName: 'click-test',
        eventHandler: function(event, arg) {
            console.log(`click recieved: ${arg}`);
        }
    },
    {
        eventName: 'hide-window',
        eventHandler: function(event, arg) {
            BrowserWindow.fromWebContents(event.sender).hide();
        }
    },
    {
        eventName: 'choose-file',
        eventHandler: function(event, arg) {
            const dialogParams = {
                title: "Choose HTML File",
                buttonLabel: "Select",
                properties: ["openFile"],
                filters: [
                    { name: "HTML", extensions: ["html"]}
                ]
            }
            let dirpath = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(event.sender), dialogParams)[0];
            if (dirpath == undefined) return;
            event.reply('ipc-debug', `Attempting to load file: "${dirpath}"`);
            this.widgetLayer.loadFile(dirpath);
        }
    },
    {
        eventName: 'quit-application',
        eventHandler: function(event, arg) {
            app.quit();
        }
    }
];

class IpcManager {
    constructor(WidgetLayer, SettingsWindow) {
        this.widgetLayer = WidgetLayer;
        this.settingsWindow = SettingsWindow;
        for (let a = 0; a < listeners.length; a++) {
            ipcMain.on(listeners[a].eventName, listeners[a].eventHandler.bind(this));
        }
    }
}

exports.IpcManager = IpcManager;