/*
main.js
Initialize the application:
- Check for single instance
- Load saved configuration if available
- Determine initial state of application
- Establish user settings page
*/
'use-strict'

// Electron modules
const { app } = require('electron');
// Standard modules
const process = require('process');
// Internal Modules
const { DecoApplication } = require('./App.js');

var Application;

// Enforce single instance
if (!app.requestSingleInstanceLock()) app.quit();
else {
    if (homePage !== null) {
        homePage.focus();
    }
}

// Initialize the application's services
function Initialize() {
    Application = new DecoApplication(process.cwd(), false);
}

// Function for testing
function InitializeTest() {
    Application = new DecoApplication(process.cwd(), true);
}

// Needed since we change default close behaviour of the settings page
app.on('quit', (event) => {
    console.log('cleanup finished');
    Application.Quit();
})

if (process.argv.length > 2) {
    switch (process.argv[2]) {
        case 'test':
            app.whenReady().then(InitializeTest);
            break;
        default:
            app.whenReady().then(Initialize).catch(console.log);
    }
} 