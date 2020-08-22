const { BrowserWindow } = require("electron");
const isWin32 = require('os').platform == 'win32';
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

class WidgetManager {
    constructor() {
        this.widgets = [];
        this.interactable = false;
    }
    // Adds a widget to be displayed
    addWidget(widgetName, filename) {
        if (path.extname(filename) != '.html') {
            throw new TypeError('Invalid file extension');
        }
        let window = (this.interactable) ? new BrowserWindow(adJustableProps) : new BrowserWindow(nonAdjustableProps);
        window.loadFile(filename);
        window.show();
        this.widgets.push({
            "filename": filename, 
            "name": widgetName,
            "browserWin": window
        });
        return this.widgets[this.widgets.length - 1];
    }
    // Redraws currently managed widgets with a framed window
    toggleAdjustable() {
        for (let a = 0; a < this.widgets.length; a++) {
            let windowDims = this.widgets[a]["browserWin"].getSize();
            let windowPos = this.widgets[a]["browserWin"].getPosition();
            let replacementWindow = (this.interactable) ? new BrowserWindow(nonAdjustableProps) : new BrowserWindow(adJustableProps);
            replacementWindow.setSize(windowDims[0], windowDims[1]);
            replacementWindow.setPosition(windowPos[0], windowPos[1]);
            replacementWindow.loadFile(this.widgets[a]["browserWin"].filename);
            this.widgets[a]["browserWin"].destroy();
            replacementWindow.show()
            if (this.interactable && isWin32) {
                let hwnd = replacementWindow.getNativeWindowHandle();
                nativeaddon.setBottomMost(hwnd);
                nativeaddon.ignoreShowDesktop(hwnd);
            }
            this.widgets[a]["browserWin"] = replacementWindow;
        }
    }
    // Creates a configuration array, allowing the app to store desktop state in a JSON file
    getConfig() {
        let configs = [];
        for (let a = 0; a < this.widgets.length; a++) {
            let dimensions = this.widgets[a]["browserWin"].getSize();
            let position = this.widgets[a]["browserWin"].getPosition();
            configs.push({
                "name": this.widgets[a]["name"],
                "width": dimensions[0],
                "height": dimensions[1],
                "x": position[0],
                "y": position[1],
                "filename": this.widgets[a].filename
            });
        }
        return configs;
    }

    parseConfig(configArray) {
        // Clear existing widget array
        while (this.widgets.length != 0) {
            let tempWidget = this.widgets.pop();
            tempWidget["browserWin"].destroy();
        }

        for (let index in configArray) {
            this.interactable = true;
            let addedWidget = this.addWidget(configArray[index].name, configArray[index].filename);
            addedWidget.browserWin.setPosition(configArray[index].x, configArray[index].y);
            addedWidget.browserWin.setSize(configArray[index].width, configArray[index].height);
        }

        return;

    }
}

exports.WidgetManager = WidgetManager;