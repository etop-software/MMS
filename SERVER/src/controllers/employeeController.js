const employeeService = require('../services/employeeService');

const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    console.log('Received employee data:', employeeData);

    const result = await employeeService.addEmployee(employeeData);

    res.status(200).json({
      message: 'Employee added successfully and command sent to in-memory event',
      data: result.data,  
    });
  } catch (error) {
    console.error('Error adding employee:', error);

    res.status(500).json({ error: 'Failed to add employee' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updatedData = req.body;

    console.log('Updating employee:', employeeId, 'with data:', updatedData);

    const updatedEmployee = await employeeService.updateEmployee(employeeId, updatedData);

    if (updatedEmployee) {
      res.status(200).json({
        message: 'Employee updated successfully',
        data: updatedEmployee,
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getAllEmployees();

    res.status(200).json({
      message: 'Employees fetched successfully',
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);

    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;  

    const employee = await employeeService.getEmployeeById(employeeId);

    if (employee) {
      res.status(200).json({
        message: 'Employee fetched successfully',
        data: employee,
      });
    } else {
      res.status(404).json({
        message: 'Employee not found',
      });
    }
  } catch (error) {
    console.error('Error fetching employee by ID:', error);

    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    console.log('Received employee ID to delete:', req.params.employeeId);
    const { employeeId } = req.params;  

    const result = await employeeService.deleteEmployee(employeeId);

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    console.error('Error deleting employee:', error);

    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
};
