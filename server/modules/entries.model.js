const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  voc: Number,
  device: { type: Schema.Types.ObjectId, ref: 'Devices' },
  date: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  }
});

const Entry = mongoose.model('Entries', entrySchema);

module.exports = Entry;
