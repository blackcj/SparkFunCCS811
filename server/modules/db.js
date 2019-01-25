// getting-started.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/air_quality');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // we're connected!
  console.log('Connected to database "air_quality"');
});
