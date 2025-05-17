// routes/mealType.routes.js
const express = require('express');
const controller = require('../controllers/mealtypeController');
const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:mealTypeId/:areaId', controller.getOne);
router.put('/:mealTypeId', controller.update);
router.delete('/:mealTypeId/:areaId', controller.remove);

module.exports = router;
