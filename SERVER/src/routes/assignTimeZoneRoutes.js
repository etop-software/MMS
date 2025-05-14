const express = require('express');
const router = express.Router();
const { assignTimeZone } = require('../controllers/assignTimeZoneController');

router.post('/assignTimeZone', assignTimeZone);

module.exports = router;
