// routes/mealRuleRoute.js

const express = require('express');
const mealRuleController = require('../controllers/mealRuleController');

const router = express.Router();

router.post('/updateMealRule', mealRuleController.updateMealRule);
router.get('/meal-rules', mealRuleController.getMealRules);

module.exports = router;
