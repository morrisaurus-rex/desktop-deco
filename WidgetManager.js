const { BrowserWindow } = require("electron");
const isWin32 = require('os').platform == 'win32';

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

    addWidget(widgetName, filename) {
        let window = (this.interactable) ? new BrowserWindow(adJustableProps) : new BrowserWindow(nonAdjustableProps);
        window.loadFile(filename);
        window.show();
        this.widgets.push({
            "filename": filename,
            "name": widgetName,
            "browserWin": window
        });
        return;
    }

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
            this.widgets[a]["browserWin"] = replacementWindow;
        }
    }

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

    parseConfig(filepath) {

    }
}
