/**
 * Webhooks are the ideal solution here but are only available for deployed
 * applications. When testing in development, we'll use a cron task for
 * populating data from the sensor.
 */

const cron = require('node-cron');
const axios = require('axios');
const Entry = require('./entries.model.js');
const Device = require('./devices.model.js');

// Make a request for data every 10 minutes
cron.schedule('*/10 * * * *', function(){
  getDataFromDevice();
});

function getDataFromDevice() {
  console.log('running a task every 10 minutes');
  axios.get(`https://api.spark.io/v1/devices/${process.env.DEVICE_ID}/result?access_token=${process.env.TOKEN}`).then(function (response) {
    Device.findOne({device_id: response.data.coreInfo.deviceID}).exec().then(foundDevice => {
      if(foundDevice) {
        const reading = JSON.parse(response.data.result);
        const entry = new Entry({
          temperature: reading.data2,
          humidity: reading.data1 ,
          device: foundDevice._id,
        });
        entry.save();
      }
    }).catch(error => {
      console.log('Error', error);
    });
    console.log(response.data);
  }).catch(function (error) {
    console.log(error);
  });
}

module.exports = {
  getDataFromDevice
}
