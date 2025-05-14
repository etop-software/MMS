const AreaService = require("../services/areaService");

// Create a new area
const createArea = async (req, res) => {
  try {
    const { name, description } = req.body;
    const area = await AreaService.createArea({ name, description });
    res.status(201).json(area);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all areas
const getAllAreas = async (req, res) => {
  try {
    const areas = await AreaService.getAllAreas();
    res.status(200).json(areas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single area by ID
const getAreaById = async (req, res) => {
  const { id } = req.params;
  try {
    const area = await AreaService.getAreaById(id);
    res.status(200).json(area);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: error.message });
  }
};

// Update an existing area by ID
const updateArea = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const area = await AreaService.updateArea(id, { name, description });
    res.status(200).json(area);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an area by ID
const deleteArea = async (req, res) => {
  const { id } = req.params;
  try {
    const area = await AreaService.deleteArea(id);
    res.status(200).json({ message: "Area deleted successfully", area });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
};
