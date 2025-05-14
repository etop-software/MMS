// services/userAuthService.js
function buildAuthorizationCommand({ cmdId, pin, timezoneId, doorId, devId, startTime, endTime }) {
    return `C:${cmdId}:DATA UPDATE userauthorize Pin=${pin}` +
           `\tAuthorizeTimezoneId=${timezoneId}` +
           `\tAuthorizeDoorId=${doorId}` +
           `\tDevID=${devId}` +
           `\tStartTime=${startTime}` +
           `\tEndTime=${endTime}`;
  }
  
  module.exports = { buildAuthorizationCommand };
  