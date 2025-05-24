const { buildAndEmitEmployeeCommands, buildAndEmitEmployeeCommandsbulkUpdate } = require('../commandsService/employeeCommandService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const addEmployee = async (employeeData) => {
  console.log("Adding employee:", employeeData);
  const {
    pin,
    password = '1234',
    group = 0,
    startTime = '09:00',
    endTime = '18:00',
    name,
    privilege = 0,
    department,
    designation,
    phone,
    email,
    RFID,
    nationality = '',
    areaAccess = [],
    selectedDevices = {},
    selectedMealRules = {},
    bulkUpdate = false,
  } = employeeData;

  const pinNum = Number(pin);
  const depnum = Number(department);
  const desnum = Number(designation);


  const areaIds = [...new Set(areaAccess.map(Number))];
  const existingAreas = await prisma.area.findMany({
    where: { id: { in: areaIds } }
  });
  const validAreaIds = new Set(existingAreas.map(a => a.id));
  const safeAreaAccess = areaIds.filter(id => validAreaIds.has(id));

  // ✅ Validate Device IDs
  const allDeviceIds = Object.values(selectedDevices).flat().map(Number);
  const existingDevices = await prisma.device.findMany({
    where: { id: { in: allDeviceIds } }
  });
  const validDeviceIds = new Set(existingDevices.map(d => d.id));

  const safeSelectedDevices = {};
  for (const [areaId, deviceIds] of Object.entries(selectedDevices)) {
    const filtered = deviceIds.filter(id => validDeviceIds.has(id));
    if (filtered.length > 0) safeSelectedDevices[areaId] = filtered;
  }

  // ✅ Validate Meal Rule IDs
  const allMealRuleIds = Object.values(selectedMealRules).flat().map(Number);
  const existingMealRules = await prisma.mealRule.findMany({
    where: { id: { in: allMealRuleIds } }
  });
  const validMealRuleIds = new Set(existingMealRules.map(r => r.id));

  const safeSelectedMealRules = {};
  for (const [deviceId, mealRuleIds] of Object.entries(selectedMealRules)) {
    const filtered = mealRuleIds.filter(id => validMealRuleIds.has(id));
    if (filtered.length > 0) safeSelectedMealRules[deviceId] = filtered;
  }



  await buildAndEmitEmployeeCommands({
    pin: pinNum,
    password,
    group,
    startTime,
    endTime,
    name,
    privilege,
    areaAccess: safeAreaAccess,
    prisma,
    RFID,
    selectedDevices: safeSelectedDevices,
    selectedMealRules: safeSelectedMealRules,
  });


  const newEmployee = await prisma.employee.create({
    data: {
      employeeId: pinNum,
      pin: pinNum,
      name,
      group,
      privilege,
      startTime,
      endTime,
      departmentId: depnum,
      designationId: desnum,
      nationality,
      phone,
      email,
      password,
      RFID,
      areaAccess: {
        create: safeAreaAccess.map(areaId => ({
          area: { connect: { id: areaId } },
        })),
      },
      deviceAccess: {
        create: Object.entries(safeSelectedDevices).flatMap(([areaId, deviceIds]) =>
          deviceIds.map(deviceId => ({
            area: { connect: { id: parseInt(areaId) } },
            device: { connect: { id: deviceId } },
          }))
        ),
      },
    },
  });

  const employeeMealAccessData = [];

  for (const [deviceIdStr, mealRuleIds] of Object.entries(safeSelectedMealRules)) {
    const deviceId = parseInt(deviceIdStr);
    let areaIdForDevice = null;

    for (const [areaIdStr, deviceIds] of Object.entries(safeSelectedDevices)) {
      if (deviceIds.includes(deviceId)) {
        areaIdForDevice = parseInt(areaIdStr);
        break;
      }
    }

    if (!areaIdForDevice) continue;

    for (const mealRuleId of mealRuleIds) {
      employeeMealAccessData.push({
        employeeId: newEmployee.id,
        areaId: areaIdForDevice,
        deviceId,
        mealRuleId,
      });
    }
  }

  if (employeeMealAccessData.length > 0) {
    await prisma.employeeMealAccess.createMany({
      data: employeeMealAccessData,
      skipDuplicates: true,
    });
  }
  return { success: true, data: newEmployee };
};

const addEmployeesInBulk = async (employeeList) => {

  const newEmployees = [];
  const validEmployeesForCommand = [];


  const allMealRules = await prisma.mealRule.findMany({
    select: { id: true, mealTypeId: true, areaId: true, deviceId: true }
  });

  const mealRuleLookup = new Map();
  for (const rule of allMealRules) {
    const key = `${rule.mealTypeId}-${rule.areaId}-${rule.deviceId}`;
    mealRuleLookup.set(key, rule.id);
  }

  const depid = Number(employeeList[0].department);
  const desid = Number(employeeList[0].designation);

  for (const employeeData of employeeList) {
    const {
      pin,
      password = '1234',
      group = 0,
      startTime = '09:00',
      endTime = '18:00',
      name,
      privilege = 0,
      departmentId,       // <-- use departmentId
      designationId,      // <-- use designationId
      phone,
      email,
      RFID,
      nationality,
      areaAccess = { create: [] },
      deviceAccess = { create: [] },
      employeeMealAccesses = { create: [] }
    } = employeeData;


    const pinNum = Number(pin);

    const newEmployee = await prisma.employee.create({
      data: {
        employeeId: pinNum,
        pin: pinNum,
        name,
        group,
        privilege,
        startTime,
        endTime,
        departmentId,      // <-- here
        designationId,     // <-- here
        phone,
        email,
        password,
        RFID,
        nationality,
        areaAccess,
        deviceAccess,
      },
    });


    const mealAccessEntries = [];
    for (const ma of employeeMealAccesses.create) {
      const { areaId, deviceId, mealTypeId } = ma;
      const key = `${mealTypeId}-${areaId}-${deviceId}`;
      const mealRuleId = mealRuleLookup.get(key);

      if (mealRuleId) {
        mealAccessEntries.push({
          employeeId: newEmployee.id,
          areaId,
          deviceId,
          mealRuleId,
        });
      } else {
        console.warn(`MealRule not found for: mealTypeId=${mealTypeId}, areaId=${areaId}, deviceId=${deviceId}`);
      }
    }

    if (mealAccessEntries.length > 0) {
      await prisma.employeeMealAccess.createMany({
        data: mealAccessEntries,
        skipDuplicates: true,
      });
    }

    validEmployeesForCommand.push({
      pin: pinNum,
      password,
      group,
      startTime,
      endTime,
      name,
      privilege,
      areaAccess: areaAccess.create.map(a => a.areaId),
      prisma,
      RFID,
      selectedDevices: deviceAccess.create.reduce((acc, d) => {
        const key = d.areaId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d.deviceId);
        return acc;
      }, {}),
      selectedMealRules: mealAccessEntries.reduce((acc, m) => {
        const key = m.deviceId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(m.mealRuleId);
        return acc;
      }, {}),
      update: false,
    });

    newEmployees.push(newEmployee);
  }


  if (validEmployeesForCommand.length > 0) {
    await buildAndEmitEmployeeCommandsbulkUpdate({
      employees: validEmployeesForCommand,
      prisma,
    });
  }

  return {
    success: true,
    data: newEmployees,
  };
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
      designation,
      nationality,
      phone,
      email,
      RFID,
      areaAccess = [],
      selectedDevices = {},
      selectedMealRules = {},
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
      nationality,
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

    if (areaRecords.length > 0) {
      await prisma.areaAccess.createMany({ data: areaRecords });
    }
    if (deviceRecords.length > 0) {
      await prisma.deviceAccess.createMany({ data: deviceRecords });
    }

    const employeeMealAccessData = [];
    for (const [deviceIdStr, mealRuleIds] of Object.entries(selectedMealRules)) {
      const deviceId = parseInt(deviceIdStr);

      let areaIdForDevice = null;
      for (const [areaIdStr, deviceIds] of Object.entries(selectedDevices)) {
        if (deviceIds.includes(deviceId)) {
          areaIdForDevice = parseInt(areaIdStr);
          break;
        }
      }
      if (!areaIdForDevice) {
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
    const depnum = Number(department);
    const designationnum = Number(designation);

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
        department: {
          connect: { id: depnum },
        },
        designation: {
          connect: { id: designationnum },
        },
        nationality,
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
      orderBy: {
        pin: 'asc',
      },
      include: {
        department: true,
        designation: true,
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
        employeeMealAccesses: {
          include: {
            area: true,
            device: true,
            mealRule: {
              include: {
                mealType: true,
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
  updateEmployee,
  addEmployeesInBulk
};
