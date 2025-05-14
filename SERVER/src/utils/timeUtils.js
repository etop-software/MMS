function toHHMM(time) {
    const [hh, mm] = time.split(':').map(Number);
    return hh * 100 + mm;
  }
  
  function encodeInterval(startTime, endTime) {
    return (toHHMM(startTime) << 16) | toHHMM(endTime);
  }
  
  function generateTimezoneCommand(cmdId, timezoneId, intervalsByDay) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const holidays = ['Hol1', 'Hol2', 'Hol3'];
  
    let command = `C:${cmdId}:DATA UPDATE timezone TimezoneId=${timezoneId}`;
  
    for (const day of days) {
      const intervals = intervalsByDay[day] || [];
      for (let i = 0; i < 3; i++) {
        const interval = intervals[i] || { start: '00:00', end: '00:00' };
        const encoded = encodeInterval(interval.start, interval.end);
        command += `\t${day}Time${i + 1}=${encoded}`;
      }
    }
  
    for (const hol of holidays) {
      const intervals = intervalsByDay[hol] || [];
      for (let i = 0; i < 3; i++) {
        const interval = intervals[i] || { start: '00:00', end: '00:00' };
        const encoded = encodeInterval(interval.start, interval.end);
        command += `\t${hol}Time${i + 1}=${encoded}`;
      }
    }
  
    command += `\tStartTime=0\tEndTime=0`;
  
    return command;
  }
  
  module.exports = {
    toHHMM,
    encodeInterval,
    generateTimezoneCommand,
  };
  