require('dotenv').config();
require('./modules/db.js');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const entriesRouter = require('./routes/entries.router.js');
const devicesRouter = require('./routes/devices.router.js');

app.use(bodyParser.json());

app.use('/entries', entriesRouter);
app.use('/devices', devicesRouter);

// Serve up static files
app.use(express.static('server/public'));

// Start the server
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})
