const { createClient } = require("redis");

let database;

const redisClient = () => {
  const currentRedis = {};

  // Create new client
  currentRedis.client = createClient();

  currentRedis.client.on("error", (err) => console.log("Redis Client Error", err));

  // return the promise of the db connection
  return new Promise((resolve) => {
    currentRedis.client.connect().then(() => {
      console.log("Redis database connection successful");
      resolve(currentRedis);
    });
  });
};

// Initialize the database
// This will be called before we start listening to express server
const initConnection = () => {
  return new Promise((resolve) => {
    // connect to our forum DB
    redisClient().then((db) => {
      database = db;
      // Resolve the connection
      resolve();
    });
  });
};

// Return the database
// This will be used in the controllers
const getDatabase = () => {
  return database;
};

// Export the init and the database connection
module.exports = { initConnection, getDatabase };
