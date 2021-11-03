const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Function to open connection to database
async function getDatabase() {
  return open({
    filename: "./db/database.db",
    driver: sqlite3.Database,
  });
}


module.exports.getDatabase = getDatabase;
