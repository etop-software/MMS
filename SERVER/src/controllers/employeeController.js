const NodeCache = require("node-cache");
const employeeService = require("../services/employeeService");

// Cache setup: 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    console.log("Received employee data:", employeeData);

    const result = await employeeService.addEmployee(employeeData);

    // Invalidate cache
    cache.del("allEmployees");

    res.status(200).json({
      message: "Employee added successfully and command sent to in-memory event",
      data: result.data,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ error: "Failed to add employee" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updatedData = req.body;

    console.log("Updating employee:", employeeId, "with data:", updatedData);

    const updatedEmployee = await employeeService.updateEmployee(employeeId, updatedData);

    if (updatedEmployee) {
      // Invalidate relevant cache
      cache.del("allEmployees");
      cache.del(`employee:${employeeId}`);

      res.status(200).json({
        message: "Employee updated successfully",
        data: updatedEmployee,
      });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const cacheKey = "allEmployees";
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        message: "Employees fetched from cache",
        data: cachedData,
      });
    }

    const employees = await employeeService.getAllEmployees();
    cache.set(cacheKey, employees);

    res.status(200).json({
      message: "Employees fetched from database",
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const cacheKey = `employee:${employeeId}`;

    const cachedEmployee = cache.get(cacheKey);
    if (cachedEmployee) {
      return res.status(200).json({
        message: "Employee fetched from cache",
        data: cachedEmployee,
      });
    }

    const employee = await employeeService.getEmployeeById(employeeId);

    if (employee) {
      cache.set(cacheKey, employee);
      res.status(200).json({
        message: "Employee fetched from database",
        data: employee,
      });
    } else {
      res.status(404).json({
        message: "Employee not found",
      });
    }
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    console.log("Received employee ID to delete:", employeeId);

    const result = await employeeService.deleteEmployee(employeeId);

    // Invalidate cache
    cache.del("allEmployees");
    cache.del(`employee:${employeeId}`);

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
};
