const express = require('express');
const router = express.Router();
const Entry = require('./../modules/entries.model.js');

router.get('/', (req, res) => {
  console.log('In GET /entries');
  Entry.find({}).limit(10).exec().then(results => {
      console.log('Found results', results);
      res.send(results);
  }).catch(error => {
    console.log('Error', error);
    res.sendStatus(500);
  });
});

module.exports = router;
