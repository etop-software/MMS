const express = require('express');
const { getMealHistory } = require('../controllers/mealHistoryController');

const router = express.Router();

router.get('/meal-history', getMealHistory);

module.exports = router;
