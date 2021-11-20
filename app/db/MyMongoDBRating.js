const mongoClient = require("./mongoClient");

const getData = () => {
  return new Promise((resolve, reject) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .find({})
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getData", err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};