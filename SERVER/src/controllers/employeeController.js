const NodeCache = require("node-cache");
const employeeService = require("../services/employeeService");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const xlsx = require('xlsx');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const cache = new NodeCache({ stdTTL: 300});

const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    const result = await employeeService.addEmployee(employeeData);

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


const importEmployees = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const normalize = str => (str || '').replace(/\s+/g, ' ').trim().toLowerCase();

    const nationalities = [
      "Indian", "Pakistani", "Bangladeshi", "Nepali", "Sri Lankan", "Bhutanese", "Maldivian", "Afghan",
      "Saudi", "Emirati", "Qatari", "Kuwaiti", "Bahraini", "Omani",
      "Jordanian", "Lebanese", "Syrian", "Iraqi", "Palestinian", "Egyptian",
      "Libyan", "Tunisian", "Algerian", "Moroccan", "Mauritanian", "Sudanese", "Yemeni", "Somali"
    ];

    function normalizeNationality(input) {
      if (!input) return null;
      const inputNorm = normalize(input);

      const matched = nationalities.find(nat => normalize(nat) === inputNorm);
      if (matched) {
        return matched; 
      } else {
        console.warn(`⚠️ Unknown nationality: "${input}"`);
        return null; 
      }
    }


    const [areas, devices, mealTypes, mealRules, departments, designations] = await Promise.all([
      prisma.area.findMany({ select: { id: true, name: true } }),
      prisma.device.findMany({ select: { id: true, deviceName: true } }),
      prisma.mealType.findMany({ select: { mealTypeId: true, name: true } }),
      prisma.mealRule.findMany({ select: { id: true, mealTypeId: true, areaId: true, deviceId: true } }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.designation.findMany({ select: { id: true, title: true } }),
    ]);


    const areaMap = Object.fromEntries(areas.map(a => [normalize(a.name), a.id]));
    const deviceMap = Object.fromEntries(devices.map(d => [normalize(d.deviceName), d.id]));
    const mealTypeMap = Object.fromEntries(mealTypes.map(mt => [normalize(mt.name), mt.mealTypeId]));


    const groupedData = data.reduce((acc, row) => {
      const pin = Number(row['Employee ID']);
      if (!acc[pin]) acc[pin] = [];
      acc[pin].push(row);
      return acc;
    }, {});


    const employeeList = Object.entries(groupedData).map(([pin, rows]) => {
      const requiredFields = [
        'Employee ID', 'Full Name', 'Password', 'Department', 'Designation', 'Nationality',
        'Access Area', 'Allowed Device', 'Meal Plan Rule'
      ];


      rows.forEach(row => {
        requiredFields.forEach(field => {
          if (!row[field]) throw new Error(`Missing "${field}" for Employee ID ${pin}`);
        });
      });

      const firstRow = rows[0];
      const fieldsToCheck = [
        'Full Name', 'Password', 'Team Number', 'Work Start Time', 'Work End Time',
        'Access Level', 'Department', 'Phone Number', 'Email', 'RFID Code'
      ];

 
      rows.forEach(row => {
        fieldsToCheck.forEach(field => {
          if (row[field] !== firstRow[field]) {
            throw new Error(`Inconsistent "${field}" for Employee ID ${pin}`);
          }
        });
      });

      const normalizedNationality = normalizeNationality(firstRow['Nationality']);
      if (!normalizedNationality) {
        throw new Error(`Invalid Nationality "${firstRow['Nationality']}" for Employee ID ${pin}`);
      }

      const rawMealRules = rows.map(row => normalize(row['Meal Plan Rule']));
      const mealRulesSet = [...new Set(rawMealRules)].filter(rule => {
        if (!mealTypeMap[rule]) {
          console.warn(`⚠️ Unknown meal type: "${rule}"`);
          return false;
        }
        return true;
      });


      const areasSet = [...new Set(rows.map(row => normalize(row['Access Area'])))];
      const devicesSet = [...new Set(rows.map(row => normalize(row['Allowed Device'])))];


      areasSet.forEach(area => {
        if (!areaMap[area]) throw new Error(`Invalid area name "${area}" for Employee ID ${pin}`);
      });
      devicesSet.forEach(device => {
        if (!deviceMap[device]) throw new Error(`Invalid device name "${device}" for Employee ID ${pin}`);
      });


      const departmentEntry = departments.find(d => normalize(d.name) === normalize(firstRow['Department']));
      if (!departmentEntry) throw new Error(`Invalid Department "${firstRow['Department']}" for Employee ID ${pin}`);
      const departmentId = departmentEntry.id;


      const designationEntry = designations.find(d => normalize(d.title) === normalize(firstRow['Designation']));
      if (!designationEntry) throw new Error(`Invalid Designation "${firstRow['Designation']}" for Employee ID ${pin}`);
      const designationId = designationEntry.id;


      const mealAccesses = mealRulesSet.map(mealRule => {
        const row = rows.find(r => normalize(r['Meal Plan Rule']) === mealRule);
        const areaId = areaMap[normalize(row['Access Area'])];
        const deviceId = deviceMap[normalize(row['Allowed Device'])];
        const mealTypeId = mealTypeMap[mealRule];
        return { areaId, deviceId, mealTypeId };
      }).filter(Boolean);

      return {
        pin: Number(firstRow['Employee ID']),
        name: firstRow['Full Name'],
        password: String(firstRow['Password']),
        group: Number(firstRow['Team Number']),
        startTime: firstRow['Work Start Time'],
        endTime: firstRow['Work End Time'],
        privilege: Number(firstRow['Access Level']),
        departmentId,
        designationId,
        phone: firstRow['Phone Number'],
        email: firstRow['Email'],
        RFID: firstRow['RFID Code'],
        nationality: normalizedNationality, 

        areaAccess: {
          create: areasSet.map(area => ({
            areaId: areaMap[area],
          })),
        },

        deviceAccess: {
          create: devicesSet.map(device => {
            const row = rows.find(r => normalize(r['Allowed Device']) === device);
            return {
              deviceId: deviceMap[device],
              areaId: areaMap[normalize(row['Access Area'])],
            };
          }),
        },

        employeeMealAccesses: {
          create: mealAccesses,
        },
      };
    });

    console.log(employeeList);

    const { data: addedEmployees } = await employeeService.addEmployeesInBulk(employeeList);
    cache.del("allEmployees");

    const results = addedEmployees.map(emp => ({
      pin: emp.pin,
      status: 'success',
      id: emp.id,
    }));

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'Employee import completed',
      results,
    });
  } catch (error) {
    console.error("Error importing employees:", error.message);
    res.status(400).json({
      error: error?.message || String(error.message) || 'Failed to import employees'
    });
  }
};


const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updatedData = req.body;

    console.log("Updating employee:", employeeId, "with data:", updatedData);

    const updatedEmployee = await employeeService.updateEmployee(employeeId, updatedData);

    if (updatedEmployee) {
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
      console.log("Fetching employees from cache");
      return res.status(200).json({
        message: "Employees fetched from cache",
        data: cachedData,
      });
    }

    const employees = await employeeService.getAllEmployees();
    
    console.log("Fetching employees from database and setting to cache");

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
  importEmployees: [upload.single('file'), importEmployees],
};
