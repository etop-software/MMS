const { buildAuthorizationCommand } = require('../services/userAuthService');
const eventEmitter = require('../eventEmitter');

const buildAndEmitEmployeeCommands = async ({ pin, password, group, startTime, endTime, name, privilege, areaAccess, prisma }) => {

 const commands = [];

  const command1 = `C:${pin}:DATA UPDATE user CardNo=\tPin=${pin}\tPassword=${password}\tGroup=${group}\tStartTime=${startTime}\tEndTime=${endTime}\tName=${name}\tPrivilege=${privilege}`;
  commands.push(command1);

  const mealRuleIds = await prisma.mealRule.findMany({
    where: { areaId: { in: areaAccess } },
    select: { mealTypeId: true },
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

    const command = buildAuthorizationCommand(authData);
    commands.push(command);
    suffix++;
  }

  const joined = commands.join('\n');

  eventEmitter.emit('employeeSetupBatch', joined);

  return joined;
};



module.exports = {
  buildAndEmitEmployeeCommands
};
