const express = require('express');
const router = express.Router();
const Entry = require('./../modules/entries.model.js');

router.get('/', (req, res) => {
  console.log('In GET /entries');
  Entry.find({}).sort({date:-1}).limit(10).exec().then(results => {
      console.log('Found results', results);
      res.send(results);
  }).catch(error => {
    console.log('Error', error);
    res.sendStatus(500);
  });
});

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
