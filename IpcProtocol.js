const { BrowserWindow, dialog, app } = require('electron');
// List of all ipcRenderer messages to listen for
// IpcManager instances will rebind 'this' on construct
'use-strict'

const ipcMainHandlers = [
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
                properties: ["openFile", "dontAddToRecent"],
                filters: [
                    { name: "HTML", extensions: ["html"]}
                ]
            }
            let dirs = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(event.sender), dialogParams);
            if (dirs == undefined) return;
            event.reply('file-added', `Attempting to load file: "${dirs[0]}"`);
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



exports.IpcList = ipcMainHandlers;