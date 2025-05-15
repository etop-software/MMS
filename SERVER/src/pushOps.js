const express = require("express");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // adjust path as needed
const crypto = require("crypto");
const { getLatestData, setLatestData } = require('./eventConsumer');
const logService = require('./services/logService');

module.exports = function (app) {
  console.log("Initializing pushOps...");

  const registeredDevices = new Set(["SYZ8243100723"]);
  const sessionStore = new Map();
  const registryCodes = new Map();

  app.get("/iclock/cdata", (req, res) => {

    console.log("Received request for /iclock/cdata");  
    const { SN, options } = req.query;

    if (options !== "all") {
      return res.status(400).send("Invalid options parameter");
    }

    let responseBody;
    if (registeredDevices.has(SN)) {
      const registryCode = generateRandomCode(32);
      const sessionId = generateSessionID();

      sessionStore.set(sessionId, {
        SN,
        registryCode,
        createdAt: Date.now(),
      });

      responseBody = [
        "registry=ok",
        `RegistryCode=${registryCode}`,
        "ServerVersion=2.0.1",
        "ServerName=ZKTeco-Push-Server",
        "PushProtVer=3.0.1",
        "ErrorDelay=60",
        "RequestDelay=30",
        "TransTimes=00:00;14:00",
        "PushOptionsFlag=1",
        "TransInterval=2",
        "TransTables=User Transaction",
        "Realtime=1",
        `SessionID=${sessionId}`,
        "TimeoutSec=10",
      ].join("\r\n");
    } else {
      responseBody = "OK";
    }

    setStandardHeaders(res, Buffer.byteLength(responseBody));
    res.send(responseBody);
  });

  app.post("/iclock/registry", (req, res) => {
    const { SN } = req.query;
    console.log('MASSS1',req.query);
 

    if (!registeredDevices.has(SN)) {
      registeredDevices.add(SN);
      console.log(`New device added: ${SN}`);
    }

    if (!registryCodes.has(SN)) {
      const registryCode = generateRegistryCode();
      registryCodes.set(SN, registryCode);
      console.log(`Generated RegistryCode for device: ${SN}`);
    }

    const registryCode = registryCodes.get(SN);
    console.log(`RegistryCode for ${SN}: ${registryCode}`);
    const responseBody = `RegistryCode=${registryCode}`;
    setStandardHeaders(res, Buffer.byteLength(responseBody));
    console.log("Response sent:", responseBody);
    res.send(responseBody);
  });

  app.post("/iclock/exchange", (req, res) => {
    const { SN, type } = req.query;
    if (!SN || !type) return res.status(400).send("Missing parameters");

    const body = req.body.toString();
    let responseBody;

    switch (type.toLowerCase()) {
      case "publickey":
        const devicePublicKey = body.replace("PublicKey=", "");
        console.log(
          `Public key exchange for ${SN}: ${devicePublicKey.substring(
            0,
            50
          )}...`
        );

        const serverPublicKey =
          "DMCvFlzRwiGI4M9TRn/3xEmkddz2lqoZR7zUrOMhOc3FLvhLtpIYu3ZMNSeKVLcZUv4iHNnxzl9B8SfuVSxXAwyijYAj6Wg4YyxTj4stv4K7q54sUCikb1CbQ/H0m9QZGyhM1WjrHhppXT/CsOAquEy/2gxfrSt3nai38Hb/8QoTHvnXJR2EVpcY6u47jBeGiXM3ZUQgCtcdB7JBXsOr71XWEsLX1fIC3GofGCy0g0bUkumWJfNKwBWfWzb95o6klDi8uP/wU+DS1uLs1VcCN0WNtX+DCajyzcYvecR8cgbs0F1QfMmiRr/dYAOkwF/bSMyuLkd+o6FmLBAh9keFtgkFa+PC5RlFGrmxpJx4lMoLfaNqUNwyAuRdKezvYBDUrRhGwgtwo/BRGUoWCeOB4YP/gHHGro0M8f3/HlSqliuT55Xks/Btp1tpfO/OeJjELUA9Yu0o4TQlnM19PuOGsYhipM9NeGGexKjtotHotLT4Ccso04nAf7TltDavoPvVGJGiDbnN7l8wsUCsqcCRsiKhpmON2waLjdFa8PNJ62N6Dl6QRPKn9XLnIDFdtKSq5Vgn";
        responseBody = `PublicKey=${serverPublicKey}`;
        break;

      case "factors":
        const deviceFactors = body.replace("Factors=", "");
        console.log(
          `Factor exchange for ${SN}: ${deviceFactors.substring(0, 50)}...`
        );

        const serverFactors =
          "XQ10e0WiFtslJW5ob221T/WCK42GXGP6mmiBB9yB93rD3CxlKZo3mavyqfTKFxtCn8AtkxL7MH4UeRvRnFTrv3Q4kKaYndiiphuvxOGQxrzcGGjH0sRzgPcTtAQu0U7A8vg2sMzZOxokqLuDVE5nlsx1/1V46wTK+oNU9q8fgKM=";
        responseBody = `Factors=${serverFactors}`;
        break;

      default:
        return res.status(400).send("Invalid exchange type");
    }

    setStandardHeaders(res, Buffer.byteLength(responseBody));
    res.send(responseBody);
  });

  app.post("/iclock/cdata",async  (req, res) => {
    const { SN, table, tablename } = req.query;

    const body = req.rawBody.toString();
    let responseBody = "OK";
    // console.log(`QRY`,req.query);
    // console.log('Raw request body:', body);

    if (table.toUpperCase() === "TABLEDATA") {
      console.log(`Received data from ${SN} for table: ${tablename}`);

      switch (tablename?.toLowerCase()) {
        case "user": {
          const parsedData = parseDataToObject(body);
          console.log("Parsed user data:", parsedData);
          // Insert into DB or handle logic here
          break;
        }

        case "extuser": {
          const parsedData = parseDataToObject(body);
          console.log("Parsed extuser data:", parsedData);
          // Insert into DB or handle logic here
          break;
        }

        case "biodata": {
          const parsedData = parseDataToObject(body);
          console.log(`Parsed ${tablename} data:`, parsedData);
          // Insert into DB or handle logic here
          break;
        }

        case "biophoto": {
          const parsedData = parseDataToObject(body);
          console.log(`Parsed ${tablename} data:`, parsedData);
          // Insert into DB or handle logic here
          break;
        }

        case "templatev10": {
          const parsedData = parseDataToObject(body);
          console.log(`Parsed ${tablename} data:`, parsedData);
          // Insert into DB or handle logic here
          break;
        }

        case "errorlog": {
          const parsedData = parseDataToObject(body);
          console.log(`Parsed ${tablename} data:`, parsedData);
          // Insert into DB or handle logic here
          break;
        }
        default:
          console.warn(`Unknown tablename: ${tablename}`);
      }
    } else if (table.toUpperCase() === "RTSTATE") {
      const parsedData = parseDataToObject(body);

      console.log("Parsed RTSTATE data:", parsedData);
    } else if (table.toUpperCase() === "RTLOG") {

      const parsedData = parseDataToObject(body);

      console.log("Parsed RTLOG data:", parsedData);  

      try {
        const log = await logService.createLog(parsedData);
      } catch (error) {
        console.error("Error saving log:", error);
      }


    } else {
      console.warn(`Unknown table type: ${table}`);
    }

    setStandardHeaders(res, Buffer.byteLength(responseBody));
    res.send(responseBody);
  });
  

//   app.get('/iclock/getrequest', async (req, res) => {

//     const { SN } = req.query;
//    const updatedDevice = await prisma.device.update({
//   where: { SN: SN },
//   data: {
//     updatedAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
//   },
// });

// const { {command || 'OK' } , SN } = getLatestData();
//   // const command = getLatestCommand() || 'OK'; 

// //console.log(`Command to send: ${command}`);
//  //const command = 'C:337:DATA DELETE user Pin=1002N';
// //const command =`C:1001:SET OPTIONS Door1CloseAndLock=0,WiegandIDIn=1,Door1Drivertime=1,Door1SensorType=1,Door1Detectortime=1,Door1Intertime=1,SlaveIOState=0,Door1VerifyType=0,Reader1IOState=1,Door1MultiCardInterTime=1,Door1ValidTZ=1,Door1SupperPassWord=,WiegandID=1,Door1ForcePassWord=,Door1KeepOpenTimeZone=1`;
//     res.send(command);
//   });

app.get('/iclock/getrequest', async (req, res) => {
  const { SN } = req.query;

  await prisma.device.update({
    where: { SN },
    data: {
      updatedAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    },
  });

  const { command, SN: lastSN } = getLatestData();
  const finalCommand = command || 'OK';

  console.log(`➡️ Sending command: ${finalCommand}`);

  res.send(finalCommand);
});


 app.post("/iclock/devicecmd", express.text({ type: "*/*" }), (req, res) => {
  const parsed = Object.fromEntries(new URLSearchParams(req.rawBody));
  const returnCode = parsed.Return;
  const SN = parsed.SN || null;

  console.log(`📥 Device response: ${req.rawBody}`);

  if (returnCode === '0') {

    setLatestData(command=`OK`);
   
    return res.send('OK');
  }

  res.send('UNKNOWN');
});


};

function parseDataToObject(data) {
  const parsedData = {};
  const regex = /(\w+)=([^\s=]+(?: [^\s=]+)?)/g;
  let match;

  while ((match = regex.exec(data)) !== null) {
    const [, key, value] = match;
    parsedData[key] = value;
  }

  return parsedData;
}

function generateRandomCode(length = 32) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
}

function generateSessionID() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

function generateRegistryCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function setStandardHeaders(res, contentLength) {
  res.set({
    Server: "ZKTeco-Push-Server/1.0",
    Date: new Date().toUTCString(),
    "Content-Type": "application/push;charset=UTF-8",
    "Content-Length": contentLength,
  });
}
