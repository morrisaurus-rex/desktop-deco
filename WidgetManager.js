const { BrowserWindow } = require("electron");
const platform = require('os').platform;
const isWin32 = platform == 'win32';
const nativeaddon = (isWin32) ? require('bindings')('win32lib'): null;
const path = require('path');

const nonAdjustableProps = {
    frame: false,
    transparent: true,
    focusable: false,
    resizable: false,
    type: (isWin32) ? 'normal': 'desktop',
    webPreferences: {
        nodeIntegration: true
    }
};

const adJustableProps = {
    transparent: true,
    focusable: true,
    resizable: true,
    type: 'normal',
    webPreferences: {
        nodeIntegration: true
    }
};
// callback for 'ready-to-show' event inn WidgetManager.addWidget()
function displayWidget(event) {
    this.show();
    this.center();
}
// Manages individaul widgets
class WidgetManager {
    constructor() {
        this.widgets = {};
        this.interactable = false;
    }
    // Adds a widget to be displayed
    addWidget(filename) {
        if (path.extname(filename) != '.html') {
            throw new TypeError('Invalid file extension');
        }
        let window = (this.interactable) ? new BrowserWindow(adJustableProps) : new BrowserWindow(nonAdjustableProps);
        window.loadFile(filename);
        if (platform != 'darwin') window.removeMenu(); 
        window.on('ready-to-show', displayWidget.bind(window));
        this.widgets[filename] = window;
        return this.widgets[filename];
    }
    // Removes a widget with the given filename
    removeWidget(filename) {
        if (this.widgets.hasOwnProperty(filename)) {
            this.widgets[filename].destroy();
            delete this.widgets[filename];
        }
    }
    // Redraws currently managed widgets with a framed window
    toggleAdjustable() {
        for (filename in this.widgets) {
            let windowDims = this.widgets[filename].getSize();
            let windowPos = this.widgets[filename].getPosition();
            let replacementWindow = (this.interactable) ? new BrowserWindow(nonAdjustableProps) : new BrowserWindow(adJustableProps);
            replacementWindow.setSize(windowDims[0], windowDims[1]);
            replacementWindow.setPosition(windowPos[0], windowPos[1]);
            replacementWindow.loadFile(filename);
            this.widgets[filename].destroy();
            // Win32 specific setup
            if (isWin32) {
                let hwnd = replacementWindow.getNativeWindowHandle();
                nativeaddon.setBottomMost(hwnd);
                if (!this.interactable) nativeaddon.ignoreShowDesktop(hwnd);
            } else {

            }
            replacementWindow.on('ready-to-show', replacementWindow.show);
            this.widgets[filename] = replacementWindow;
        }
        this.interactable = !this.interactable;
    }
    // Creates a configuration array, allowing the app to store desktop state in a JSON file
    getConfig() {
        let configs = {};
        for (filename in this.widgets) {
            let dimensions = this.widgets[filename].getSize();
            let position = this.widgets[filename].getPosition();
            configs[filename] = {
                "width": dimensions[0],
                "height": dimensions[1],
                "x": position[0],
                "y": position[1],
                "filename": filename
            };
        }
        return configs;
    }
    // Parses a configuration object returned by getConfig()
    parseConfig(configArray) {
        this.unloadAll();
        this.interactable = true;
        for (let filename in configArray) {
            let addedWidget = this.addWidget(configArray[filename].filename);
            addedWidget.setSize(configArray[filename].width, configArray[filename].height);
            addedWidget.setPosition(configArray[filename].x, configArray[filename].y);
        }
        return;
    }
    // Unloads all widgets
    unloadAll() {
        for (name in this.widgets) {
            this.widgets[name].destroy();
            delete this.widgets[name];
        }
    }
}

exports.WidgetManager = WidgetManager;