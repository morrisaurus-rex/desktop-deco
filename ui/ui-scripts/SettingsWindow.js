const { ipcRenderer } = require('electron');
let app = null, path = null, fs = null;

// Button selectors
let button = document.querySelector('#upload-button'),
    closeButton = document.querySelector('#close-button'),
    exitButton = document.querySelector('#exit-button'),
    testButton = document.querySelector('#test-button');

// Content box slectors
let layoutList = document.querySelector('#layout-list');


function getLayoutInfo(callback) {
    if (app == null) {
        app = require('electron').app;
        path = require('path');
        fs = require('fs');
    }
    let appDataPath = app.getPath("userData");
    fs.readFile(path.join(appDataPath, 'config'), (data, err) => {
        // TODO: Consider caching user configs to reduce frequency of file reads
        let configObj = JSON.parse(data);
        callback(configObj);
    });
}

function populateLayoutList(config) {
    while (layoutList.hasChildNodes()) {
        layoutList.removeChild(layoutList.firstChild);
    }
    let layouts = config["savedLayouts"];
    if (layouts.length == 0) {
        let noLayouts = document.createElement('p');
        noLayouts.innerHTML = 'No layouts found';
        layoutList.appendChild(noLayouts)
    }
}

function createLayoutListItem(layoutName) {
    let item = document.createElement('div');
    item.setAttribute('class', 'layout-list-item');
    
}

function layoutListClick(layoutName ,event) {

}

button.addEventListener('click', (event) => {
    ipcRenderer.send('choose-file');
});

ipcRenderer.on('ipc-debug', (event, arg) => {
    console.log('[IPC message]', arg);
});

closeButton.addEventListener('click', (event) => {
    ipcRenderer.send('hide-window');
});

exitButton.addEventListener('click', event => {
    ipcRenderer.send('quit-application');
});

testButton.addEventListener('click', event => {
    // Used for testing some kind of behaviour or functionality
    ipcRenderer.send('test-function');
});