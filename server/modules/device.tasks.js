const cron = require('node-cron');
const axios = require('axios');
const Entry = require('./../modules/entries.model.js');
const Device = require('./../modules/devices.model.js');

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
        console.log('Enabling polling for ', id);
        if (typeof intervalInMinutes !== 'number') {
            throw new TypeError('Interval must be a number');
        }
        // Ensure there are no decimal places in the interval
        intervalInMinutes = parseInt(intervalInMinutes);

        // Only add the device if it doesn't already exist in the object
        if (!this.devices[id]) {
            this.devices[id] = cron.schedule(`*/${intervalInMinutes} * * * * *`, () => {
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
        Device.findOne({ _id: id }, '+auth_token').exec().then(foundDevice => {
            if (foundDevice) {
                // TODO: In some error cases, it may be better to back off on request frequency
                axios.get(`https://api.spark.io/v1/devices/${foundDevice.device_id}/result?access_token=${foundDevice.auth_token}`).then(function (response) {
                    console.log(response.data);
                    const reading = JSON.parse(response.data.result);
                    const entry = new Entry({
                        temperature: reading.temp,
                        humidity: reading.humidity,
                        voc: reading.voc,
                        device: foundDevice._id,
                    });
                    entry.save();
                }).catch( error => {
                    console.log('Error', error.response.status, error.response.statusText);
                });
            }
        }).catch(error => {
            console.log('Error', error);
        });
    }
}

module.exports = DeviceTaskManager;