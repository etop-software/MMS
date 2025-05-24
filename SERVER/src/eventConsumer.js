const e = require("express");
const eventEmitter = require("./eventEmitter");

let latestData = {
  command: "OK", // default value for command
  SN: null,      // initialize SN as null
};

// Event listener for 'newEmployee'
eventEmitter.on("newEmployee", (command) => {
  latestData.command = command;  // Store the received command
  console.log("✅ Received new employee command:", command);
});

eventEmitter.on('newTimeZone', ({ command, SN }) => {
  latestData.command = command;  // Store the received command
  latestData.SN = SN;            // Store the received SN
});

eventEmitter.on("assignTimeZoneCommand", (command) => {
  latestData.command = command;  // Store the received command
  console.log("✅ Received new assignTimeZoneCommand:", command);
});

eventEmitter.on("employeeSetupBatch", ({ command, SN }) => {
  latestData.command = command;  
  latestData.SN = SN;            
  console.log("✅ Received employeeSetupBatch command:", command);
});

eventEmitter.on("employeeSetupBatchBulk", ({ command, SN }) => {
  latestData.command = command; 
  latestData.SN = SN;         
  console.log("✅ Received employeeSetupBatchBulk command:", command);
});


const setLatestData = (command, SN) => {
  latestData.command = command;
  latestData.SN = SN;            
};


const getLatestData = () => latestData;

module.exports = { getLatestData, setLatestData };
