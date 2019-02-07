const cron = require('node-cron');
const axios = require('axios');
const instance = axios.create({ baseURL: 'http://localhost:5000' })
let task;
let deviceId;

function startMockTask(id) {
    stopMockTask();
    deviceId = id;
    task = cron.schedule('*/1 * * * *', function () {
        sendMockData();
    });
    sendMockData();
}

function stopMockTask() {
    if (task) {
        task.stop();
    }
}

function sendMockData() {
    const result = {
        data2: 70, // temp
        data1: 32  // humidity
    };
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
    })
}

module.exports = {
    startMockTask,
    stopMockTask
}