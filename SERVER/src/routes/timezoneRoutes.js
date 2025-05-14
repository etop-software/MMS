const express = require('express');
const router = express.Router();
const { generateTimezoneCommandController } = require('../controllers/timezoneController');

router.post('/generate-timezone-command', generateTimezoneCommandController);

module.exports = router;
