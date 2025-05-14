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
    areaAccess = [],
    selectedDevices = {}
  } = employeeData;

 
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
  selectedDevices
});

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
      areaAccess,
      selectedDevices,
    } = updatedData;

    const employee = await prisma.employee.findUnique({
      where: { pin: Number(employeeId) },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const command1 = `C:${pin}:DATA UPDATE user CardNo=\tPin=${pin}\tPassword=${password}\tGroup=${group}\tStartTime=${startTime}\tEndTime=${endTime}\tName=${name}\tPrivilege=${privilege}`;
    const allCommands = [command1];

    const mealRuleIds = await prisma.mealRule.findMany({
      where: {
        areaId: { in: areaAccess },
      },
      select: {
        mealTypeId: true,
      },
    });

    const mealRuleIdsArray = mealRuleIds.map((rule) => rule.mealTypeId);

    let suffix = 1;
    for (const timezoneId of mealRuleIdsArray) {
      const cmdId = Number(`${pin}${suffix}`);
      const authData = {
        cmdId,
        pin,
        timezoneId,
        doorId: 1,
        devId: 1,
        startTime: 803520000,
        endTime: 836860799,
      };
      const command2 = buildAuthorizationCommand(authData);
      allCommands.push(command2);
      suffix++;
    }

    eventEmitter.emit("employeeSetupBatch", allCommands.join("\n"));

    await prisma.areaAccess.deleteMany({
      where: { employeeId: employee.id },
    });

    await prisma.deviceAccess.deleteMany({
      where: { employeeId: employee.id },
    });

    const areaRecords = areaAccess.map((areaId) => ({
      employeeId: employee.id,
      areaId,
    }));

    const deviceRecords = Object.entries(selectedDevices || {}).flatMap(
      ([areaId, deviceIds]) =>
        (deviceIds).map((deviceId) => ({
          employeeId: employee.id,
          areaId: Number(areaId),
          deviceId,
        }))
    );

    await prisma.areaAccess.createMany({ data: areaRecords });
    await prisma.deviceAccess.createMany({ data: deviceRecords });

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
      },
    });

    return employees;
  } catch (error) {
    console.error('Error fetching all employees:', error);
    throw error;
  }
};

const getEmployeeById = async (employeeId) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        pin: employeeId,
      },
    });
    return employee;
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    throw error;
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

    eventEmitter.emit('employeeDeletion', `Employee with ID ${employeeId} is being deleted.`);

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
