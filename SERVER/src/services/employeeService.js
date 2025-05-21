const { buildAndEmitEmployeeCommands} = require('../commandsService/employeeCommandService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const addEmployee = async (employeeData) => {
  const {
    pin,
    password = '1234',
    group = 0,
    startTime = '09:00',
    endTime = '18:00',
    name,
    privilege = 0,
    department,
    phone,
    email,
    RFID,
    areaAccess = [],
    selectedDevices = {},
    selectedMealRules = {},  // changed to object { deviceId: [mealRuleIds] }
  } = employeeData;

  // Call to build commands and emit
  await buildAndEmitEmployeeCommands({
    pin,
    password,
    group,
    startTime,
    endTime,
    name,
    privilege,
    areaAccess,
    prisma,
    RFID,
    selectedDevices,
    selectedMealRules,
  });

  // Create employee with areaAccess and deviceAccess relations
  const newEmployee = await prisma.employee.create({
    data: {
      employeeId: pin,
      pin,
      name,
      group,
      privilege,
      startTime,
      endTime,
      department,
      phone,
      email,
      password,
      RFID,
      areaAccess: {
        create: areaAccess.map((areaId) => ({
          area: { connect: { id: areaId } },
        })),
      },
      deviceAccess: {
        create: Object.entries(selectedDevices).flatMap(([areaId, deviceIds]) =>
          deviceIds.map((deviceId) => ({
            area: { connect: { id: parseInt(areaId) } },
            device: { connect: { id: deviceId } },
          }))
        ),
      },
    },
  });

  // Now create EmployeeMealAccess records
  const employeeMealAccessData = [];

  // selectedMealRules is { deviceId: [mealRuleIds] }
  for (const [deviceIdStr, mealRuleIds] of Object.entries(selectedMealRules)) {
    const deviceId = parseInt(deviceIdStr);
    
    // Find areaId for this device from selectedDevices mapping
    // selectedDevices: { areaId: [deviceIds] }
    let areaIdForDevice = null;
    for (const [areaIdStr, deviceIds] of Object.entries(selectedDevices)) {
      if (deviceIds.includes(deviceId)) {
        areaIdForDevice = parseInt(areaIdStr);
        break;
      }
    }
    if (!areaIdForDevice) {
      // If device isn't mapped to an area in selectedDevices, skip or handle error
      continue;
    }

    for (const mealRuleId of mealRuleIds) {
      employeeMealAccessData.push({
        employeeId: newEmployee.id,
        areaId: areaIdForDevice,
        deviceId,
        mealRuleId,
      });
    }
  }

  // Bulk create all meal access records
  if (employeeMealAccessData.length > 0) {
    await prisma.employeeMealAccess.createMany({
      data: employeeMealAccessData,
      skipDuplicates: true,  // optional, to avoid duplicate errors
    });
  }

  return { success: true, data: newEmployee };
};


const updateEmployee = async (employeeId, updatedData) => {
  try {
    const {
      pin,
      password,
      group,
      startTime,
      endTime,
      name,
      privilege,
      department,
      phone,
      email,
      RFID,
      areaAccess = [],
      selectedDevices = {},
      selectedMealRules = {},  // Expecting object { deviceId: [mealRuleIds] }
    } = updatedData;

    const employee = await prisma.employee.findUnique({
      where: { pin: Number(employeeId) },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    await buildAndEmitEmployeeCommands({
      pin,
      password,
      group,
      startTime,
      endTime,
      name,
      privilege,
      areaAccess,
      prisma,
      RFID,
      selectedDevices,
      selectedMealRules,
      update: true,  // Indicate this is an update
    });

    // Delete previous relations
    await prisma.areaAccess.deleteMany({ where: { employeeId: employee.id } });
    await prisma.deviceAccess.deleteMany({ where: { employeeId: employee.id } });
    await prisma.employeeMealAccess.deleteMany({ where: { employeeId: employee.id } });

    // Create new areaAccess records
    const areaRecords = areaAccess.map((areaId) => ({
      employeeId: employee.id,
      areaId,
    }));

    // Create new deviceAccess records
    const deviceRecords = Object.entries(selectedDevices).flatMap(
      ([areaId, deviceIds]) =>
        deviceIds.map((deviceId) => ({
          employeeId: employee.id,
          areaId: Number(areaId),
          deviceId,
        }))
    );

    // Bulk insert areaAccess and deviceAccess
    if (areaRecords.length > 0) {
      await prisma.areaAccess.createMany({ data: areaRecords });
    }
    if (deviceRecords.length > 0) {
      await prisma.deviceAccess.createMany({ data: deviceRecords });
    }

    // Prepare EmployeeMealAccess records
    const employeeMealAccessData = [];
    for (const [deviceIdStr, mealRuleIds] of Object.entries(selectedMealRules)) {
      const deviceId = parseInt(deviceIdStr);

      // Find areaId for this device from selectedDevices mapping
      let areaIdForDevice = null;
      for (const [areaIdStr, deviceIds] of Object.entries(selectedDevices)) {
        if (deviceIds.includes(deviceId)) {
          areaIdForDevice = parseInt(areaIdStr);
          break;
        }
      }
      if (!areaIdForDevice) {
        // Device not found in selectedDevices under any area - skip or handle accordingly
        continue;
      }

      for (const mealRuleId of mealRuleIds) {
        employeeMealAccessData.push({
          employeeId: employee.id,
          areaId: areaIdForDevice,
          deviceId,
          mealRuleId,
        });
      }
    }

    // Bulk insert meal access records
    if (employeeMealAccessData.length > 0) {
      await prisma.employeeMealAccess.createMany({
        data: employeeMealAccessData,
        skipDuplicates: true,
      });
    }

    // Update employee base info
    const updatedEmployee = await prisma.employee.update({
      where: { pin: Number(employeeId) },
      data: {
        pin,
        password,
        group,
        startTime,
        endTime,
        name,
        privilege,
        department,
        phone,
        email,
        RFID,
      },
    });

    return { success: true, data: updatedEmployee };
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};



const getAllEmployees = async () => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        areaAccess: {
          include: { area: true },
        },
        deviceAccess: {
          include: {
            device: {
              include: { area: true },
            },
          },
        },
        employeeMealAccesses: {               // ← use the plural relation name
          include: {
            area: true,                       // if you need area info
            device: true,                     // device info
            mealRule: {
              include: {
                mealType: true,               // for mealType.name, start/end times, etc.
              },
            },
          },
        },
      },
    });

    return employees;
  } catch (error) {
    console.error("Error fetching all employees:", error);
    throw error;
  }
};



const getEmployeeById = async (employeeId) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        pin: Number(employeeId),
      },
      include: {
        areaAccess: {
          include: {
            area: true,
          },
        },
        deviceAccess: {
          include: {
            device: {
              include: {
                area: true,
              },
            },
          },
        },
      }
    });
    if (!employee) {
      throw new Error(`Employee with pin ${employeeId} not found`);
    }
    return employee;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error; // Rethrow for caller to handle
  }
};

const deleteEmployee = async (employeeId) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        pin: Number(employeeId),
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

  //  eventEmitter.emit('employeeDeletion', `Employee with ID ${employeeId} is being deleted.`);

    // Delete related AreaAccess and DeviceAccess records first
    await prisma.areaAccess.deleteMany({
      where: {
        employeeId: employee.id,
      },
    });

    await prisma.deviceAccess.deleteMany({
      where: {
        employeeId: employee.id,
      },
    });

    // Now delete the employee
    await prisma.employee.delete({
      where: {
        pin: Number(employeeId),
      },
    });

    return {
      success: true,
      message: `Employee with ID ${employeeId} deleted successfully.`,
    };
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};


module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee
};
