const { BrowserWindow } = require('electron');
const PAGE_PATH = './ui/SettingsWindow.html';

// Default parameters for the settings window
const WindowParams = {
    width: 500,
    height: 700,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        defaultFontFamily: 'sansSerif'
    },
    center: true,
    devTools: true
}

function createSettingsPage() {
    let page = new BrowserWindow(WindowParams);
    page.loadFile(PAGE_PATH);
    page.on('ready-to-show', page.show);
    page.on('close', event => {
        event.preventDefault();
        page.hide();
    });
    return page;
}
// Note: BrowserWindow is not intended to be extended since it wraps native c++ classes
class SettingsPage {
    constructor() {
        this.window = new BrowserWindow(WindowParams);
        this.window.loadFile(PAGE_PATH);
        this.window.on('ready-to-show', this.window.show);
        this.window.on('close', event => {
            event.preventDefault()
            this.window.hide();
        });
    }
}

exports.createSettingsPage = createSettingsPage;