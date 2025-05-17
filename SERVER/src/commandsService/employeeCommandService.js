const { buildAuthorizationCommand } = require('../services/userAuthService');
const eventEmitter = require('../eventEmitter');

const buildAndEmitEmployeeCommands = async ({
  pin,
  password,
  group,
  startTime,
  endTime,
  name,
  privilege,
  areaAccess,
  prisma,
  selectedDevices,
  RFID
}) => {
  const commands = [];
  let suffix = 1;


  const allSelectedDeviceIds = Object.values(selectedDevices).flat();

  const devices = await prisma.device.findMany({
    where: { id: { in: allSelectedDeviceIds } },
    select: { id: true, SN: true },
  });

  for (const device of devices) {
    const baseCommand = `C:${pin}:DATA UPDATE user CardNo=${RFID}\tPin=${pin}\tPassword=${password}\tGroup=${group}\tStartTime=${startTime}\tEndTime=${endTime}\tName=${name}\tPrivilege=${privilege}`;
    commands.push({ SN: device.SN, command: baseCommand });
  }

 
  const mealRules = await prisma.mealRule.findMany({
    where: {
      deviceId: { in: allSelectedDeviceIds },
    },
    select: {
      mealTypeId: true,
      deviceId: true,
    },
  });

  for (const rule of mealRules) {
    const cmdId = Number(`${pin}${suffix++}`);
    const authCommand = buildAuthorizationCommand({
      cmdId,
      pin,
      timezoneId: rule.mealTypeId,
      doorId: 1,
      devId: rule.deviceId,
      startTime: 803520000,
      endTime: 836860799,
    });


    const deviceSN = devices.find((d) => d.id === rule.deviceId)?.SN;
    if (deviceSN) {
      commands.push({ SN: deviceSN, command: authCommand });
    }
  }

  const commandsBySN = {};
  for (const { SN, command } of commands) {
    if (!commandsBySN[SN]) commandsBySN[SN] = [];
    commandsBySN[SN].push(command);
  }

 for (const [SN, cmds] of Object.entries(commandsBySN)) {
  const joined = cmds.join('\n');
  eventEmitter.emit('employeeSetupBatch', { SN, command: joined });
}


  return commandsBySN;
};

module.exports = {
  buildAndEmitEmployeeCommands,
};
