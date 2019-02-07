require('dotenv').config();
require('./modules/db.js');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const entriesRouter = require('./routes/entries.router.js');
const devicesRouter = require('./routes/devices.router.js');

// const mockTasks = require('./modules/mock.tasks.js');
// Start mocking device id 2a0028000251353530373132
// mockTasks.startMockTask('2a0028000251353530373132');

app.use(bodyParser.json());

app.use('/entries', entriesRouter);
app.use('/devices', devicesRouter);

// Serve up static files
app.use(express.static('server/public'));

// Start the server
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})
