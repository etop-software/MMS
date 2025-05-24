const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const department = await prisma.department.create({
      data: { name, description },
    });

    res.status(201).json(department);
  } catch (error) {
    console.error('Create Department Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { employees: true },
    });
    res.json(departments);
  } catch (error) {
    console.error('Get Departments Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one department by id
const getDepartmentById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const department = await prisma.department.findUnique({
      where: { id },
      include: { employees: true },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get Department By Id Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update department by id
const updateDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: { name, description },
    });

    res.json(department);
  } catch (error) {
    console.error('Update Department Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete department by id
const deleteDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.department.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ error: 'Department not found' });
    }

    await prisma.department.delete({ where: { id } });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete Department Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
