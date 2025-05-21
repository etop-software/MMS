const express = require('express');
const router = express.Router();
const deviceController = require('./../controllers/deviceController');

// Get devices by area
router.get('/devices', deviceController.getDevicesByArea);

router.get('/meal-rules', deviceController.getMealRulesByDevice);

// Get all devices (optional)
router.get('/', deviceController.getAllDevices);

// Create a new device
router.post('/', deviceController.createDevice);

// Update an existing device
router.put('/:id', deviceController.updateDevice);


// Delete a device
router.delete('/:deviceId', deviceController.deleteDevice);

module.exports = router;
