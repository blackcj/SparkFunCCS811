require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const axios = require('axios');
const cron = require('node-cron');

// Make a request for data every 10 minutes
cron.schedule('*/10 * * * *', function(){
  console.log('running a task every 10 minutes');
  axios.get(`https://api.spark.io/v1/devices/${process.env.DEVICE_ID}/result?access_token=${process.env.TOKEN}`).then(function (response) {
    // TODO: Save results in the database
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
});

// Serve up static files
app.use(express.static('server/public'));

// Start the server
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})
