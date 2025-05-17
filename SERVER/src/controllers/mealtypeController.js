// controllers/mealType.controller.js
const service = require('../services/mealtypeService');

exports.create = async (req, res) => {
    console.log('Request body:', req.body);
  try {
    const result = await service.createMealType(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });

  }
};

exports.getAll = async (req, res) => {
  const result = await service.getAllMealTypes();
  res.json(result);
};

exports.getOne = async (req, res) => {
  const { mealTypeId, areaId } = req.params;
  const result = await service.getMealType(mealTypeId, areaId);
  if (!result) return res.status(404).json({ message: 'Not found' });
  res.json(result);
};

exports.update = async (req, res) => {
  const { mealTypeId} = req.params;


  try {
    const result = await service.updateMealType(mealTypeId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const { mealTypeId, areaId } = req.params;
  try {
    await service.deleteMealType(mealTypeId, areaId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
