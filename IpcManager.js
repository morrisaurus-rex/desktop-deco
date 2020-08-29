const { ipcMain, BrowserWindow, dialog, app } = require('electron');
const path = require('path');
// List of all ipcRenderer messages to listen for
// IpcManager instances will rebind 'this' on construct
'use-strict'

const ipcHandlers = [
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
            let dirs = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(event.sender), dialogParams);
            if (dirs == undefined) return;
            event.reply('ipc-debug', `Attempting to load file: "${dirs[0]}"`);
            this.widgetManager.addWidget(dirs[0]);
        }
    },
    {
        eventName: 'quit-application',
        eventHandler: function(event, arg) {
            app.quit();
        }
    },
    {
        eventName: 'test-function',
        eventHandler: function(event, arg) {
            // Testing function for miscellaneous stuff
        }
    }
];

class IpcManager {
    constructor(WidgetManager, SettingsWindow) {
        this.widgetManager = WidgetManager;
        this.settingsWindow = SettingsWindow;
        for (let a = 0; a < ipcHandlers.length; a++) {
            ipcMain.on(ipcHandlers[a].eventName, ipcHandlers[a].eventHandler.bind(this));
        }
    }
}

exports.IpcManager = IpcManager;