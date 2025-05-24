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

  const allSelectedDeviceIds = Object.values(selectedDevices).flat();

  const devices = await prisma.device.findMany({
    where: { id: { in: allSelectedDeviceIds } },
    select: { id: true, SN: true },
  });

  const deviceToArea = {};
  for (const [areaId, deviceIds] of Object.entries(selectedDevices)) {
    for (const deviceId of deviceIds) {
      deviceToArea[deviceId] = Number(areaId);
    }
  }

  for (const device of devices) {
    const baseCommand = `C:${pin}:DATA UPDATE user CardNo=${RFID}\tPin=${pin}\tPassword=${password}\tGroup=${group}\tStartTime=${startTime}\tEndTime=${endTime}\tName=${name}\tPrivilege=${privilege}`;
    if (!commandsBySN[device.SN]) commandsBySN[device.SN] = [];
    commandsBySN[device.SN].push(baseCommand);
  }

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

    if (update && !deleteInsertedForSN.has(deviceSN)) {
      const deleteAuthCommand = `C:${pin}:DATA DELETE userauthorize Pin=${pin}`;
      commandsBySN[deviceSN].push(deleteAuthCommand);
      deleteInsertedForSN.add(deviceSN);
    }

    commandsBySN[deviceSN].push(authCommand);
  }

  for (const [SN, cmds] of Object.entries(commandsBySN)) {
    const joined = cmds.join('\n');
    eventEmitter.emit('employeeSetupBatch', { SN, command: joined });
  }

  return commandsBySN;
};

const buildAndEmitEmployeeCommandsbulkUpdate = async ({ employees, prisma }) => {
  let suffix = 1;
  const commandsBySN = {};

  for (const employee of employees) {
    const {
      pin,
      password,
      group,
      startTime,
      endTime,
      name,
      privilege,
      areaAccess,
      selectedDevices,
      RFID,
      selectedMealRules,
      update
    } = employee;

    const allSelectedDeviceIds = Object.values(selectedDevices).flat();

    const devices = await prisma.device.findMany({
      where: { id: { in: allSelectedDeviceIds } },
      select: { id: true, SN: true },
    });

    const deviceToArea = {};
    for (const [areaId, deviceIds] of Object.entries(selectedDevices)) {
      for (const deviceId of deviceIds) {
        deviceToArea[deviceId] = Number(areaId);
      }
    }

    for (const device of devices) {
      const baseCommand = `C:${pin}:DATA UPDATE user CardNo=${RFID}\tPin=${pin}\tPassword=${password}\tGroup=${group}\tStartTime=${startTime}\tEndTime=${endTime}\tName=${name}\tPrivilege=${privilege}`;
      if (!commandsBySN[device.SN]) commandsBySN[device.SN] = [];
      commandsBySN[device.SN].push(baseCommand);
    }

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

    const processedDevices = new Set();

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

      const deviceSN = devices.find(d => d.id === rule.deviceId)?.SN;
      if (!deviceSN) continue;

      if (!commandsBySN[deviceSN]) commandsBySN[deviceSN] = [];

      if (update && !processedDevices.has(rule.deviceId)) {
        const deleteAuthCommand = `C:${pin}:DATA DELETE userauthorize Pin=${pin}`;
        commandsBySN[deviceSN].push(deleteAuthCommand);
        processedDevices.add(rule.deviceId);
      }

      commandsBySN[deviceSN].push(authCommand);
    }
  }

  // Emit commands per SN
  for (const [SN, cmds] of Object.entries(commandsBySN)) {
    const joined = cmds.join('\n');
    console.log(`employeeSetupBatchBulk SN=${SN}`, joined);
    eventEmitter.emit('employeeSetupBatchBulk', { SN, command: joined });
  }

  return commandsBySN;
};


module.exports = {
  buildAndEmitEmployeeCommands,
  buildAndEmitEmployeeCommandsbulkUpdate,
};
