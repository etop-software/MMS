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
  update
}) => {
  const commandsBySN = {};
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
    if (!commandsBySN[device.SN]) commandsBySN[device.SN] = [];
    commandsBySN[device.SN].push(baseCommand);
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

  // Track which SNs already had DELETE inserted
  const deleteInsertedForSN = new Set();

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
    if (!deviceSN) continue;

    if (!commandsBySN[deviceSN]) commandsBySN[deviceSN] = [];

    // If update is true, insert DELETE command once per device
    if (update && !deleteInsertedForSN.has(deviceSN)) {
      const deleteAuthCommand = `C:${pin}:DATA DELETE userauthorize Pin=${pin}`;
      commandsBySN[deviceSN].push(deleteAuthCommand);
      deleteInsertedForSN.add(deviceSN);
    }

    commandsBySN[deviceSN].push(authCommand);
  }

  // Emit batched commands per SN
  for (const [SN, cmds] of Object.entries(commandsBySN)) {
    const joined = cmds.join('\n');
    eventEmitter.emit('employeeSetupBatch', { SN, command: joined });
  }

  return commandsBySN;
};

module.exports = {
  buildAndEmitEmployeeCommands,
};
