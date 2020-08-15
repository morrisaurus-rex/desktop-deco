const { ipcRenderer } = require('electron');

let button = document.querySelector('#upload-button'),
    closeButton = document.querySelector('#close-button')

button.addEventListener('click', (event) => {
    ipcRenderer.send('choose-file');
});

ipcRenderer.on('ipc-debug', (event, arg) => {
    console.log('[IPC message]', arg);
});

closeButton.addEventListener('click', (event) => {
    ipcRenderer.send('hide-window');
});