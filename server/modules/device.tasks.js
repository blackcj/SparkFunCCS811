const cron = require('node-cron');
const axios = require('axios');

/**
 * DeviceTaskManager manages a list of device ids and will pool each
 * of the devices at the specified interval.
 */
class DeviceTaskManager {
    constructor() {
        // Stores id's for the devices to create mock data for
        this.devices = {};
    }

    startDeviceTask(id, intervalInMinutes) {
        if (typeof intervalInMinutes !== 'number') {
            new TypeError('Interval must be a number');
        }
        // Ensure there are no decimal places in the interval
        intervalInMinutes = parseInt(intervalInMinutes);

        // Only add the device if it doesn't already exist in the object
        if (!this.devices[id]) {
            this.devices[id] = cron.schedule(`*/${intervalInMinutes} * * * *`, () => {
                const deviceId = id;
                this.requestData(deviceId);
            },);
        }
    }

    // Helper function used to check if an Object has no properties
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    stopDeviceTask(deviceId) {
        if (this.devices[deviceId]) {
            this.devices[deviceId].destroy();
            delete this.devices[deviceId];
        } 
    }

    requestData(id) {
        console.log(`Requesting data for ${id}`);
        // Find device in the database by id
        
        // Make axios request to the device

        // Store results in the database
    }
}

module.exports = DeviceTaskManager;