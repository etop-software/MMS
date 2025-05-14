const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
} = require('../controllers/employeeController');

router.post('/employees', createEmployee);

router.put('/employees/:employeeId', updateEmployee);
router.get('/employees', getAllEmployees);

router.get('/employees/:employeeId', getEmployeeById);

router.delete('/employees/:employeeId', deleteEmployee);

module.exports = router;
