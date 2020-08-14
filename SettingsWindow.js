const { BrowserWindow } = require('electron');
const PAGE_PATH = './ui/ConfigWindow.html';

const WindowParams = {
    width: 500,
    height: 700,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        defaultFontFamily: 'sansSerif'
    },
    center: true,
    
}

function createSettingsPage() {
    let settingsWindow = new BrowserWindow(WindowParams);
    settingsWindow.loadFile(PAGE_PATH);
    settingsWindow.on('ready-to-show', (ev)=>{ settingsWindow.show(); });
    return settingsWindow;
}

exports.createSettingsPage = createSettingsPage;