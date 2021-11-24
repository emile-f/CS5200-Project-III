const mongoClient = require("./mongoClient");

// Function to get all restaurants
// used on the edit/add rating page
async function getRestaurants() {
  return new Promise((resolve, reject) => {


    const agg = [
      {
        "$project": {
          "restID": 1,
          "name": 1,
          "_id": 0
        }
      }
    ];

    mongoClient
      .getDatabase()
      .connection.collection("restaurantDB")
      .aggregate(agg)
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getRestaurants", err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
}

module.exports.getRestaurants = getRestaurants;
