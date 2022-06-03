// RenderPreload.js

const { contextBridge } = require('electron');
const os = require('os');

let HardwareMetricsApi = {
    // Returns CPU usage as a proportion of non-idle time to total CPU time, returns a promise
    GetCpuUsage: function(sampleInterval) {
        let cpuInfo = os.cpus().time;
        let totalTime = sumObjectMembers(cpuInfo);
        let result = new Promise((res, rej) => {
            setTimeout(() => {
                let currentCpuInfo = os.cpus().time;
                let currentTotalTime = sumobjectMembers(currentCpuInfo);
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


contextBridge.exposeInMainWorld('HardwareMetrics', HardwareMetricsApi);
