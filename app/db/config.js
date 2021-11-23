const fs = require("fs");

// Get environment
let env =
  process.argv.indexOf("-env") === -1
    ? process.env["ENV"] || "localhost"
    : process.argv[process.argv.indexOf("-env") + 1];

// read config file when developing
let configJson = {};
if (env === "localhost") {
  try {
    // Get current folder
    configJson = JSON.parse(
      fs.readFileSync(__dirname + "/config.json").toString()
    );
  } catch (err) {
    console.warn("No config.json file was found for this repository");
    configJson = {
      "port": 3001,
      "mongo": {
        "uri": "mongodb://localhost:27017"
      }
    };
  }
} else {
  // use env variables when on deploy server
  let port =
    process.argv.indexOf("-port") === -1
      ? process.env["PORT"] || "3000"
      : process.argv[process.argv.indexOf("-port") + 1];

  let uri =
    process.argv.indexOf("-uri") === -1
      ? process.env["URI"] || ""
      : process.argv[process.argv.indexOf("-uri") + 1];

  configJson[env] = {
    port,
    mongo: {
      uri,
    },
  };
}

// Set env config
let envConfig = configJson || {};
envConfig["env"] = env;

// Export the config
module.exports = envConfig;
