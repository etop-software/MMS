const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new designation
const createDesignation = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const designation = await prisma.designation.create({
      data: { title, description },
    });

    res.status(201).json(designation);
  } catch (error) {
    console.error('Create Designation Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getDesignations = async (req, res) => {
  try {
    const designations = await prisma.designation.findMany({
    });
    res.json(designations);
  } catch (error) {
    console.error('Get Designations Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one designation by id
const getDesignationById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const designation = await prisma.designation.findUnique({
      where: { id },
      include: { employees: true },
    });

    if (!designation) {
      return res.status(404).json({ error: 'Designation not found' });
    }

    res.json(designation);
  } catch (error) {
    console.error('Get Designation By Id Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update designation by id
const updateDesignation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description } = req.body;

    const designation = await prisma.designation.update({
      where: { id },
      data: { title, description },
    });

    res.json(designation);
  } catch (error) {
    console.error('Update Designation Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete designation by id
const deleteDesignation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.designation.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ error: 'Designation not found' });
    }

    await prisma.designation.delete({ where: { id } });

    res.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    console.error('Delete Designation Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
};
