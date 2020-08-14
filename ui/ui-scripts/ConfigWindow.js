const { ipcRenderer } = require('electron');
let button = document.querySelector('#testbutton');

button.addEventListener('click', (event)=>{
    ipcRenderer.send()
});