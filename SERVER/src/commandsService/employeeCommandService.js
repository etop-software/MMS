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
  RFID,
  selectedMealRules,
}) => {
  const commands = [];
  let suffix = 1;

  // Flatten all device IDs from selectedDevices
  const allSelectedDeviceIds = Object.values(selectedDevices).flat();

  // Fetch SNs for those devices
  const devices = await prisma.device.findMany({
    where: { id: { in: allSelectedDeviceIds } },
    select: { id: true, SN: true },
  });

  // Build lookup map: deviceId -> areaId
  const deviceToArea = {};
  for (const [areaId, deviceIds] of Object.entries(selectedDevices)) {
    for (const deviceId of deviceIds) {
      deviceToArea[deviceId] = Number(areaId);
    }
  }

  // Base user update commands per device
  for (const device of devices) {
    const baseCommand = `C:${pin}:DATA UPDATE user CardNo=${RFID}\tPin=${pin}\tPassword=${password}\tGroup=${group}\tStartTime=${startTime}\tEndTime=${endTime}\tName=${name}\tPrivilege=${privilege}`;
    commands.push({ SN: device.SN, command: baseCommand });
  }

  // Fetch all selected mealRule records by PK
  const selectedMealRuleIds = Object.values(selectedMealRules).flat();
  const mealRules = await prisma.mealRule.findMany({
    where: {
      id: { in: selectedMealRuleIds },
    },
    select: {
      id: true,
      deviceId: true,
      mealTypeId: true,
    },
  });

  // Build authorization commands per valid mealRule
  for (const rule of mealRules) {
    const expectedRuleIds = selectedMealRules[rule.deviceId];
    if (!expectedRuleIds || !expectedRuleIds.includes(rule.id)) continue;

    const areaId = deviceToArea[rule.deviceId];
    if (!areaAccess.includes(areaId)) continue;

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

  // Group commands by SN and emit
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
