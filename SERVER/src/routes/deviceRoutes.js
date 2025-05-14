const express = require('express');
const router = express.Router();
const deviceController = require('./../controllers/deviceController');

// Get devices by area
router.get('/devices', deviceController.getDevicesByArea);

// Get all devices (optional)
router.get('/devices/all', deviceController.getAllDevices);

// Create a new device
router.post('/devices', deviceController.createDevice);

// Update an existing device
router.put('/devices', deviceController.updateDevice);

// Delete a device
router.delete('/devices/:deviceId', deviceController.deleteDevice);

module.exports = router;
