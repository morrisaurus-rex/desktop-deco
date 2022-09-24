const { BrowserWindow, dialog, app } = require('electron');
// List of all ipcRenderer messages to listen for
// IpcManager instances will rebind 'this' on construct
'use-strict'
// Lists the possible IPC events that the main process can receive and their event handlers
const ipcMainHandlersList = {
    ClickTest: {
        Message: "click-test",
        Handler: function(event, arg) {
            console.log(`click received: ${arg}`);
        }
    },
    HideWindow: {
        Message: "hide-window",
        Handler: function(event, arg) {
            BrowserWindow.fromWebContents(event.sender).hide();
        }
    },
    ChooseFile: {
        Message: "choose-file",
        Handler: function(event, arg) {
            const DialogParams = {
                title: "Choose HTML FILE",
                buttonLabel: "Select",
                properties: ["openFile", "dontAddToRecent"],
                filters: [{ name: "HTML", extensions: ["html"]}]
            }
            let dirs = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(event.sender), dialogParams);
            if (dirs == undefined) return;
            event.reply("file-added", `Attempting to load file: "${dirs[0]}"`);
            this.AddWidget(dirs[0]);
        }
    },
    QuitApp: {
        Message: "quit-application",
        Handler: function(event, arg) {
            app.quit();
        }
    },
    Test: {
        Message: "test-function",
        Handler: function(event, arg) {
            console.log(`[IPC] "test-function" message sent`);
        }
    }
}

/**
 * List of events sent by {@link ipcMain}.
 */
const ipcMainEventList = {
    // Tell widget layer to enable mouse events
    EnableWidgets: "edit-mode-on",
    // Tell widget layer to disable mouse events
    DisableWidgets: "edit-mode-off",
    // Tells the widget layer to load the sent layout data
    LoadLayout: "load-layout",
    // Tells the widget layer to clear everything
    ClearLayout: "clear-layout",
    // Tells the widget layer to move the given widget to the given xy coordinates
    MoveWidget: "move-widget",
    // Tells the widget layer to add a new widget
    AddWidget: "add-widget"
};

exports.MainHandlers = ipcMainHandlersList;
exports.MainEvents = ipcMainEventList;