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

exports.createSettingsPage = createSettingsPage;