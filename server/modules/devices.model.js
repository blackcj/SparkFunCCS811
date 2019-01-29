const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  device_id: String,
  location: String,
  polling_enabled: {
    type: Boolean,
    default: false
  },
  date_added: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  }
});

const Device = mongoose.model('Devices', deviceSchema);

module.exports = Device;
