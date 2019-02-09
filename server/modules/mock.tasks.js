const cron = require('node-cron');
const axios = require('axios');
const instance = axios.create({ baseURL: 'http://localhost:5000' });

class MockTask {
    constructor() {
        this.cronTask = cron.schedule('*/1 * * * *', (id) => {
            this.sendMockData();
        }, {
            scheduled: false
        });
        this.tasks = [];
    }
    startMockTask(id) {
        this.stopMockTask(id);
        this.tasks.push(id);
        this.cronTask.start();

        // Send right away to make debugging easier
        this.sendMockData();
    }

    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    stopMockTask(deviceId) {
        const foundIndex = this.tasks.indexOf(deviceId);
        if (foundIndex >= 0) {
            array.splice(foundIndex, 1);
        }
        if (this.tasks.length === 0 && this.cronTask) {
            this.cronTask.stop();
        }
    }

    sendMockData() {
        const result = {
            data2: 70, // temp
            data1: 32  // humidity
        };
        for (const deviceId of this.tasks) {
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
}

module.exports = MockTask;