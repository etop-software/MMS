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
  RFID,
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
      RFID
,

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
      RFID,
      areaAccess,
      selectedDevices,
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
  selectedDevices
});

    

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
        RFID,
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
