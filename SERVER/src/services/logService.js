const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const eventEmitter = require('../eventEmitter'); // Adjust the path as necessary



class LogService {
  async createLog(data) {
    try {

      const date = new Date(data.time);


      if (data.pin === '0') {
        return null;
      }

      if (data.event !== '1') {
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
      const expireCommand = `C:${data.pin}:DATA DELETE userauthorize Pin=${data.pin}`;
      eventEmitter.emit('employeeSetupBatch', {
        SN: data.SN,
        command: expireCommand,
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
