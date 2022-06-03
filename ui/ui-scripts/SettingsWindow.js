var ipcRenderer, app, path, fs;


try { // Fallback for testing on non-Electron environment
    
    ipcRenderer = require('electron').ipcRenderer;
    app = require('electron').app, path = require('path'), fs = require('fs');
    // Click handler for layout items
    function layoutListClick(layoutName ,event) {
        if (this.classList.contains('layout-item-selected')) {
            return;
        }
        for (let a = 0; a < layoutList.childNodes.length; a++) {
            if (layoutList.childNodes[a].classList.contains('layout-item-selected')) {
                layoutList.childNodes[a].classList.remove('layout-list-selected');
            }
        }
        ipcRenderer.send('set-layout', layoutName);
    }

    // Event listener for picking a file
    button.addEventListener('click', (event) => {
        ipcRenderer.send('choose-file');
    });

    // IPC listener: fires when app sends a debug message
    ipcRenderer.on('ipc-debug', (event, arg) => {
        console.log('[IPC message]', arg);
    });

    // IPC listener: fires when app has set a new layout
    ipcRenderer.on('set-layout', (event, arg) => {
        let item = document.querySelector(`#item-${arg}`);
        item.classList.add('layout-item-selected');
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

} catch(refError) { 
    console.log("Script does not have access to NodeJS modules");
}
function getLayoutInfo(callback) {

}

function populateLayoutList(config) {
    while (layoutList.hasChildNodes()) {
        layoutList.removeChild(layoutList.firstChild);
    }
    let layouts = config["savedLayouts"];
    if (layouts.length == 0) {
        let noLayouts = document.createElement('p');
        noLayouts.innerHTML = 'No layouts found';
        layoutList.appendChild(noLayouts);
    } else {
        for (let a = 0; a < layouts.length; a++) {
            layoutList.appendChild(creatLayoutListItem());
        }
    }
}
// Called by populateLayoutList
function createLayoutListItem(layoutName) {
    let item = document.createElement('div');
    item.setAttribute('class', 'layout-list-item');
    item.setAttribute('id', `item-${layoutName}`);
    item.addEventListener('click', layoutListClick.bind(item, layoutName));

}



// Button selectors
let button = document.querySelector('#upload-button'),
    closeButton = document.querySelector('#close-button'),
    exitButton = document.querySelector('#exit-button'),
    testButton = document.querySelector('#test-button');

// Content box slectors
let layoutList = document.querySelector('#layout-list');

// Setting panes
let settingPanes = document.querySelectorAll('.settings-page');
