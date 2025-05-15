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
}) => {
  const commands = [];
  let suffix = 1;

  // 🔹 Flatten all selected device IDs
  const allSelectedDeviceIds = Object.values(selectedDevices).flat();

  // 1️⃣ Get device SNs
  const devices = await prisma.device.findMany({
    where: { id: { in: allSelectedDeviceIds } },
    select: { id: true, SN: true },
  });

  // 2️⃣ Send base command to all selected devices
  for (const device of devices) {
    const baseCommand = `C:${pin}:DATA UPDATE user CardNo=\tPin=${pin}\tPassword=${password}\tGroup=${group}\tStartTime=${startTime}\tEndTime=${endTime}\tName=${name}\tPrivilege=${privilege}`;
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

  // 4️⃣ Create userauthorize command per (mealRule, device)
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

    // get SN for device
    const deviceSN = devices.find((d) => d.id === rule.deviceId)?.SN;
    if (deviceSN) {
      commands.push({ SN: deviceSN, command: authCommand });
    }
  }

  // 5️⃣ Group by SN and emit
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
