const { BrowserWindow, app, ipcMain } = require("electron");
const platform = require('os').platform;
const path = require('path');
const fs = require('fs');

// BrowserWindow options for the constructor
const commonProps = {
    frame: false,
    transparent: true,
    resizable: false,
    moveable: false,
    roundedCorners: false,
    webPreferences: {
        preload: path.join(app.getAppPath(), "NativeApi.js"),
        devTools: true,
    }
};

const nonInteractable = {
    ...commonProps,
    focusable: false,
    type: (platform == 'win32') ? 'normal': 'desktop'

};

const interactable = {
    ...commonProps,
    focusable: true,
    type: 'normal'
};

// Default directory for saved files
const APPLICATION_SAVE_DIRECTORY = path.join(app.getPath('documents'), 'Desktop-Deco');

/**
 * Business application logic. Should manage the individual HTML iframes.
 */
class App {
    constructor(props) {
        let windowProps = structuredClone(nonInteractable);
        if (props && props.exposeNode) windowProps.webPreferences.nodeIntegration = true;
        this.widgets = {};
        this.interactable = false;
        this.window = new BrowserWindow(nonInteractable);
    }
    /**
     * Controls whether the widget plane will recieve mouse and keyboard events.
     * @param {boolean} enableEdits - (_Optional_) True to make the WidgetPlane interactable, false to make it uninteractable.
     */
    ToggleEditing(enableEdits) {
        if (arguments.length == 0) {
            this.interactable = !this.interactable;
        } else {
            this.interactable = enableEdits;
        }
        this.window.setEnabled(enableEdits);
        this.window.setFocusable(enableEdits);
    }
    /**
     * Adds a widget to the main plane.
     * @
     */
    AddWidget(widgetPath) {

    }
}

exports.DecoApplication = App;
exports.DEFAULT_DIRECTORY = APPLICATION_SAVE_DIRECTORY;