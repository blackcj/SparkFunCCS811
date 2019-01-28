const express = require('express');
const router = express.Router();
const Entry = require('./../modules/entries.model.js');
const Device = require('./../modules/devices.model.js');

/**
 * @api {get} /entries/:device Request Entries from a specific Device
 * @apiName GetEntries
 * @apiGroup Entries
 *
 * @apiParam {String} device Device unique _id.
 *
 * @apiSuccess (200) {Object[]} entries             List of entries.
 * @apiSuccess (200) {Number}   entries.humidity    Humidity.
 * @apiSuccess (200) {String}   entries.temperature Temperature.
 */
router.get('/:device', (req, res) => {
  console.log('In GET /entries');
  Entry.find({device: req.params.device}).sort({date:-1}).limit(10).exec().then(results => {
      console.log('Found results', results);
      res.send(results);
  }).catch(error => {
    console.log('Error', error);
    res.sendStatus(500);
  });
});

/**
 * @api {post} /entries Add a new Entry for a specific Device
 * @apiName PostEntries
 * @apiGroup Entries
 *
 * @apiParam {Object} result           Object sent by device.
 * @apiParam {String} result.data1     Humidity.
 * @apiParam {String} result.data2     Temperature.
 *
 */
router.post('/', (req, res) => {
  console.log('In POST /entries');
  console.log(req.body);
  const reading = JSON.parse(req.body.result);
  const entry = new Entry({
    temperature: reading.data2,
    humidity: reading.data1,
    device: req.body.coreInfo.deviceID,
  });
  entry.save().then(addedEntry => {
    console.log('Added entry', addedEntry);
    res.sendStatus(201);
  }).catch( error => {
    res.sendStatus(500);
  });
});

module.exports = router;
