const redisClient = require("./redisClient.js");
const lodashKeys = require("lodash.keys");
const ObjectId = require("mongodb").ObjectId;

/*
Rating [
  {
    _id: new ObjectId("61996621181603ed946186f6"),
    Food: 5,
    Service: 5,
    cost: 5,
    overall: 4.6,
    parking: 4,
    ratingId: 771,
    restID: 24,
    waiting: 4,
    customer: {
      ambience: 'family',
      budget: 'medium',
      customerID: 46,
      drinkLevel: 'abstemious',
      name: 'Agatha Kinzett',
      smoker: false,
      dressCode: 'informal',
      cuisine: [Array],
      paymentMethods: [Array]
    },
    restaurant: {
      _id: new ObjectId("619d76fa1c569872895f1f4d"),
      address: 'Miguel Barragan 46 Centro',
      city: 'Cd. Victoria',
      country: 'Mexico',
      name: 'Log Yin',
      restID: 24,
      state: 'Morelos',
      zip: 78269,
      facilities: [Object],
      services: [Object],
      workingDays: [Array],
      payments: [Array],
      cuisine: [Array],
      priceRange: [Object],
      workingHours: [Object],
      dressCode: '?'
    }
  }
]
*/

async function setRating(ratingId, rating) {
  const redisInstance = redisClient.getDatabase();
  rating = rating[0];

  // JSON stringify nested objects
  rating._id = new ObjectId(rating._id).toString();
  rating["customer"] = JSON.stringify(rating["customer"]);
  rating["restaurant"] = JSON.stringify(rating["restaurant"]);

  //  insert into redis
  await redisInstance.client.hSet(`rating:${ratingId}`, rating);
  // set expire time to 5 mins
  await redisInstance.client.expire(`rating:${ratingId}`, 300);

  return;
}

async function checkAndGetRating(ratingId) {
  return new Promise((resolve) => {
    const redisInstance = redisClient.getDatabase();
    let returnValue = null;
    // get value from redis
    redisInstance.client.hGetAll(`rating:${ratingId}`)
      .then((rating) => {
        let c = {};
        try {
          c = Object.assign({}, rating);
        } catch (error) {
          console.log("Failed to parse rating cache result");
        }
        const k = lodashKeys(c);
        if (k && k.length > 0) {
          returnValue = c;
          returnValue._id = new ObjectId(returnValue._id);
          returnValue["customer"] = JSON.parse(returnValue["customer"]);
          returnValue["restaurant"] = JSON.parse(returnValue["restaurant"]);
        }
        resolve(returnValue);
      });
  });
}

async function deleteRating(ratingId) {
  const redisInstance = redisClient.getDatabase();

  //  delete from redis
  await redisInstance.client.del(`rating:${ratingId}`);

  return;
}

module.exports.setRating = setRating;
module.exports.checkAndGetRating = checkAndGetRating;
module.exports.deleteRating = deleteRating;