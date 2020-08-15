const { ipcRenderer } = require('electron');

let button = document.querySelector('#upload-button'),
    closeButton = document.querySelector('#close-button'),
    exitButton = document.querySelector('#exit-button');

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