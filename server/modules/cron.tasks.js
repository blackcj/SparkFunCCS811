const cron = require('node-cron');
const axios = require('axios');
const Entry = require('./entries.model.js');

// Make a request for data every 10 minutes
cron.schedule('*/10 * * * *', function(){
  getDataFromDevice();
});

function getDataFromDevice() {
  console.log('running a task every 10 minutes');
  axios.get(`https://api.spark.io/v1/devices/${process.env.DEVICE_ID}/result?access_token=${process.env.TOKEN}`).then(function (response) {
    // TODO: Save results in the database
    console.log(response.data);
    const reading = JSON.parse(response.data.result);
    const entry = new Entry({
      temperature: reading.data2,
      humidity: reading.data1 ,
      device: response.data.coreInfo.deviceID,
    });
    entry.save();
  }).catch(function (error) {
    console.log(error);
  });
}

module.exports = {
  getDataFromDevice
}
