const e = require("express");
const eventEmitter = require("./eventEmitter");

// Initialize latest data with default values
let latestData = {
  command: "OK", // default value for command
  SN: null,      // initialize SN as null
};

// Event listener for 'newEmployee'
eventEmitter.on("newEmployee", (command) => {
  latestData.command = command;  // Store the received command
  console.log("✅ Received new employee command:", command);
});

// Event listener for 'newTimeZone'
eventEmitter.on('newTimeZone', ({ command, SN }) => {
  latestData.command = command;  // Store the received command
  latestData.SN = SN;            // Store the received SN
});

// Event listener for 'assignTimeZoneCommand'
eventEmitter.on("assignTimeZoneCommand", (command) => {
  latestData.command = command;  // Store the received command
  console.log("✅ Received new assignTimeZoneCommand:", command);
});

// Event listener for 'employeeSetupBatch'
eventEmitter.on("employeeSetupBatch", (command) => {
  latestData.command = command;  // Store the received command
  console.log("✅ Received employeeSetupBatch command:", command);
});

// Function to set latest data
const setLatestData = (command, SN) => {
  latestData.command = command;  // Update the command
  latestData.SN = SN;            // Update the SN
};

// Function to get the latest data (command and SN)
const getLatestData = () => latestData;

module.exports = { getLatestData, setLatestData };
