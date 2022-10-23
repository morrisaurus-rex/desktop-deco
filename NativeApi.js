/**
 * NativeApi.js
 * Preloaded into the BrowserWindow to expose some information like hardware telemetry to widget programmers.
 */

const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');
const { MainEvents } = require('IpcProtocol.js');
/**
 * Gives scripts in the renderer process a way to query CPU metrics.
 */
const HardwareMetricsApi = {
    // Returns CPU usage as a proportion of non-idle time to total CPU time, returns a promise
    GetCpuUsage: function(sampleInterval) {
        let cpuInfo = os.cpus().time;
        let totalTime = sumObjectMembers(cpuInfo);
        let result = new Promise((res, rej) => {
            setTimeout(() => {
                let currentCpuInfo = os.cpus().time;
                let currentTotalTime = sumObjectMembers(currentCpuInfo);
                let totalTimeDiff = currentTotalTime = totalTime;
                let idleTimeDiff = currentCpuInfo.idle - cpuInfo.idle;
                res(idleTimeDiff/totalTimeDiff);
            }, sampleInterval);
        });
        return result;
    },
    GetCpuTimes: function() {
        let times = os.cpus().time;
        return times;
    },
    // Returns the amount of memory being used as a floating-point number between 0 and 1
    GetMemUsage: function() {
        let total = os.totalmem();
        let free = os.freemem();
        return (total - free) / total;
    },

};

function sumObjectMembers(object) {
    let sum = 0;
    for (let member of object) {
        sum += member;
    }
    return sum;
}

// Safely expose a way for the Application window to access Electron's IPC functions.
const ElectronIpc = {
    RegisterIpc: function(widgetManager) {
        ipcRenderer.on(MainEvents.RemoveWidget, widgetManager.RemoveWidgetHandler);
        ipcRenderer.on(MainEvents.AddWidget, widgetManager.AddWidgetHandler);
        ipcRenderer.on(MainEvents.ClearLayout, widgetManager.ClearWidgetHandler);
        ipcRenderer.on(MainEvents.MoveWidget, widgetManager.MoveWidgetHandler);
    },
    MoveWidget: function(widgetPath, xpos, ypos) {
        ipcRenderer.send(MainEvents.MoveWidget, widgetPath, xpos, ypos);
    },
    RemoveWidget: function(widgetPath) {
        ipcRenderer.send(MainEvents.RemoveWidget, widgetPath);
    },
    AddWidget: function(widgetPath, x, y, width, height) {
        ipcRenderer.send(MainEvents.AddWidget, widgetPath, x, y, width, height);
    },
    ResizeWidget: function(widgetPath, w, h) {
        ipcRenderer.send(MainEvents.ResizeWidget, widgetPath, w, h);
    },
    LockWidgets: function() {
        ipcRenderer.send(MainEvents.LockWidgets);
    },
    ClearLayout: function() {
        ipcRenderer.send(MainEvents.ClearLayout)
    }
}


contextBridge.exposeInMainWorld('HardwareMetrics', HardwareMetricsApi);
contextBridge.exposeInMainWorld('ElectronIpc', ElectronIpc);