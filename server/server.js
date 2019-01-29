require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const db = require('./modules/db.js');
const entriesRouter = require('./routes/entries.router.js');
const devicesRouter = require('./routes/devices.router.js');
const cronTasks = require('./modules/cron.tasks.js');

app.use(bodyParser.json());

// Initial reading right away for debugging
cronTasks.getDataFromDevice();

app.use('/entries', entriesRouter);
app.use('/devices', devicesRouter);

// Serve up static files
app.use(express.static('server/public'));

// Start the server
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})
