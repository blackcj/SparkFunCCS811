const express = require('express');
const router = express.Router();
const Entry = require('./../modules/entries.model.js');
const Device = require('./../modules/devices.model.js');

/**
 * @api {get} /devices Get Devices
 * @apiDescription This will be updated to only return devices for the logged in user. Right now, we'll assume a single user.
 * @apiName GetDevices
 * @apiGroup Devices
 *
 * @apiSuccess (200) {Object[]} devices             List of devices.
 * @apiSuccess (200) {String}   devices.location    Location of the device (e.g. Living Room).
 * @apiSuccess (200) {String}   devices.device_id   Particle console device id.
 */
router.get('/', (req, res) => {
  console.log('In GET /devices');
  Device.find({}).sort({date_added:-1}).limit(10).exec().then(results => {
    res.send(results);
  }).catch(error => {
    console.log('Error', error);
    res.sendStatus(500);
  });
});

/**
 * @api {post} /devices Add Device
 * @apiName PostDevice
 * @apiGroup Devices
 *
 * @apiParam {Object} device              Object containing device properties.
 * @apiParam {String} device.location     Location of the device (e.g. Living Room).
 * @apiParam {String} devices.device_id   Particle console device id.
 *
 */
router.post('/', (req, res) => {
  console.log('In POST /devices');
  console.log(req.body);
  const device = new Device(req.body);
  device.save().then(addedDevice => {
    res.sendStatus(201);
  }).catch( error => {
    console.log('Error', error);
    res.sendStatus(500);
  });
});

/**
 * @api {put} /devices/:id Update Device
 * @apiName PutDevice
 * @apiGroup Devices
 *
 * @apiParam {Number} id Device unique ID.
 *
 * @apiParam {Object} device              Object containing device properties.
 * @apiParam {String} device.location     Location of the device (e.g. Living Room).
 * @apiParam {String} devices.device_id   Particle console device id.
 *
 */
router.put('/:id', (req, res) => {
  console.log('In PUT /devices');
  Device.findByIdAndUpdate(req.params.id, req.body, {new: true}).exec().then(updatedDevice => {
    res.send(updatedDevice);
  }).catch(error => {
    console.log('Error', error);
    res.sendStatus(500);
  });
});

module.exports = router;
