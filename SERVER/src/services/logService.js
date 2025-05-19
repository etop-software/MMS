const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LogService {
  async createLog(data) {
    try {
       
        const date = new Date(data.time);
      console.log("Original date (will be inserted):", date);

      // For debugging only — if you want to see what +4 hours would look like
      const adjustedDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);
      console.log("Adjusted date (for reference only):", adjustedDate);
  
      if (data.pin === '0') {
        console.warn("Skipping log insertion: pin is '0'");
        return null;
      }

      if (data.event !== '1') {
        console.warn("Skipping log insertion: event is not '1'");
        return null;
      }

      const log = await prisma.logs.create({
        data: {
          time: date,
          pin: Number(data.pin),
          cardno: Number(data.cardno),
          eventaddr: Number(data.eventaddr),
          event: Number(data.event),
          inoutstatus: Number(data.inoutstatus),
          verifytype: Number(data.verifytype),
          index: Number(data.index),
          sitecode: Number(data.sitecode),
          linkid: Number(data.linkid),
          maskflag: Number(data.maskflag),
          temperature: Number(data.temperature),
          convtemperature: Number(data.convtemperature),
        },
      });
      return log;
    } catch (err) {
      console.error("Log creation error:", err);
      throw new Error('Failed to create log entry');
    }
  }

  async getAllLogs() {
    return await prisma.logs.findMany();
  }
}

module.exports = new LogService();
