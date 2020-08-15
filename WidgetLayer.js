// WidgetLayer.js
const { BrowserWindow, globalShortcut } = require('electron');
let width = null, height = null;

const isWin32 = require('os').platform() === 'win32';
let nativeaddon = null;
if (isWin32) {
    // required to set window below others and ignore WinKey + D shortcut
    nativeaddon = require('bindings')('win32lib');
}
let windowProps = {
    frame: false,
    transparent: true,
    focusable: false,
    resizable: false,
    width: 800,
    height: 800,
    type: (isWin32) ? 'normal': 'desktop',
    webPreferences: {
        nodeIntegration: true
    }
};
// Do not create a modal window from this since we're anchoring it to the win32 desktop shell
function createWidgetLayer(filepath) {
    let layer = new BrowserWindow(windowProps);
    layer.setIgnoreMouseEvents(true);
    layer.on('ready-to-show', layer.show);
    if (isWin32) {
        nativeaddon.setBottomMost(layer.getNativeWindowHandle());
        console.log(nativeaddon.ignoreShowDesktop(layer.getNativeWindowHandle()));
    }
    layer.maximize();
    if (filepath != undefined) {
        layer.loadFile(filepath);
    }
    return layer;
}

exports.createWidgetLayer = createWidgetLayer;