const MongoClient = require("mongodb").MongoClient;
const config = require("./config");

// Guide: https://dzone.com/articles/crud-operations-on-mongodb-thru-nodejs

let mongoDatabase;

const mongoDb = (uri, dbName) => {
  const currentMongo = {};

  // Mongo db options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Create new client with options
  // the uri is gotten from the config file or env. variables
  currentMongo.client = new MongoClient(uri, options);

  // return the promise of the db connection
  return new Promise((resolve) => {
    currentMongo.client.connect((err) => {
      if (err) throw err;
      currentMongo.connection = currentMongo.client.db(dbName);

      console.log("Successfully connected to mongo client!");
      resolve(currentMongo);
    });
  });
};

// Initialize the database
// This will be called before we start listening to express server
const initConnection = () => {
  return new Promise((resolve) => {
    // Get uri from the config
    const uri = config.mongo.uri;
    // connect to our forum DB
    mongoDb(uri, "restaurant-reviews").then((db) => {
      mongoDatabase = db;
      // Resolve the connection
      resolve();
    });
  });
};

// Return the database
// This will be used in the controllers
const getDatabase = () => {
  return mongoDatabase;
};

// Export the init and the database connection
module.exports = { initConnection, getDatabase };
