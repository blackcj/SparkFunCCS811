const cron = require('node-cron');
const axios = require('axios');
const instance = axios.create({ baseURL: 'http://localhost:5000' });
const tasks = [];
const cronTask = cron.schedule('*/1 * * * *', (id) => {
    sendMockData();
}, {
    scheduled: false
});

function startMockTask(id) {
    stopMockTask(id);
    tasks.push(id);
    cronTask.start();
    
    // Send right away to make debugging easier
    sendMockData();
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function stopMockTask(deviceId) {
    const foundIndex = tasks.indexOf(deviceId);
    if (foundIndex >= 0) {
        array.splice(foundIndex, 1);
    }
    if (tasks.length === 0 && cronTask) {
        cronTask.stop();
    }
}

function sendMockData() {
    const result = {
        data2: 70, // temp
        data1: 32  // humidity
    };
    for(const deviceId of tasks) {
        instance({
            method: 'POST',
            url: '/entries',
            data: {
                result: JSON.stringify(result),
                coreInfo: {
                    deviceID: deviceId
                }
            }

        }).catch(error => {
            console.log(error);
        });
    }
}

module.exports = {
    startMockTask,
    stopMockTask
}