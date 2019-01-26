const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  voc: Number,
  room: String,
  device: String,
  date: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  }
});

const Entry = mongoose.model('Entries', entrySchema);

module.exports = Entry;
