const cron = require('node-cron');
const axios = require('axios');
const instance = axios.create({ baseURL: 'http://localhost:5000' });

/**
 * MockTask manages a list of device ids and will send mock data
 * to the server at a set interval for each of those devices. This
 * class is intended to be used for development purposes. A separate
 * class will be created to pool real device data at a set interval.
 */
class MockTask {
    constructor() {
        // Send data every minute
        this.cronTask = cron.schedule('*/1 * * * *', (id) => {
            this.sendMockData();
        }, {
            scheduled: false
        });
        // Stores id's for the devices to create mock data for
        this.devices = [];
    }

    startMockTask(id) {
        // Only add the device if it doesn't already exist in the array
        if (this.devices.indexOf(id) < 0) {
            this.devices.push(id);
        }
        // If the cronTask is stopped, start it
        if (this.cronTask.getStatus() === 'stoped') {
            this.cronTask.start();
        }
        
        // Send right away to make debugging easier
        this.sendMockData();
    }

    // Helper function used to check if an Object has no properties
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Remove a device from list and stop sending mock data for that device
    stopMockTask(deviceId) {
        const foundIndex = this.devices.indexOf(deviceId);
        if (foundIndex >= 0) {
            array.splice(foundIndex, 1);
            if (this.devices.length === 0 && this.cronTask) {
                this.cronTask.stop();
            }
        }
    }

    // This function is called every time a new device id is addd to the
    // device array and by the cronTask at the interval set in the constructor
    sendMockData() {
        const result = {
            data2: 70, // temp
            data1: 32  // humidity
        };
        for (const deviceId of this.devices) {
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