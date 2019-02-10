const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const deviceSchema = new mongoose.Schema({
  device_id: String,
  location: String,
  auth_token: String,
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

// Device id and token should not be stored in plain text. We will need to pull them out for
// polling so they should not be hashed.
const encKey = process.env.ENCRYPTION_KEY;
if (!encKey) {
  throw new Error('Encryption key is required! Please see README.md for more information.');
}

// Encrypt device id and token before saving to the database
deviceSchema.pre("save", function (next) {
  try {
    this.device_id = CryptoJS.AES.encrypt(this.device_id, encKey).toString(); 
    this.auth_token = CryptoJS.AES.encrypt(this.device_id, encKey).toString();
    next();
  } catch (err) {
    next(err);
  }
});

// Decrypt the device id and token on the way out
deviceSchema.post('init', function (doc) {
  doc.device_id = CryptoJS.AES.decrypt(doc.device_id, encKey).toString(CryptoJS.enc.Utf8);
  doc.auth_token = CryptoJS.AES.decrypt(doc.auth_token, encKey).toString(CryptoJS.enc.Utf8);
});

const Device = mongoose.model('Devices', deviceSchema);

module.exports = Device;
