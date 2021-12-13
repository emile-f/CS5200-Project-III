const redisClient = require("./redisClient.js");
const lodashKeys = require("lodash.keys");

/*
customer {
  ambience: 'family',
  budget: 'low',
  id: 314,
  drinkLevel: 'casual drinker',
  name: 'Adler Glossup',
  smoker: false,
  dressCode: 'informal',
  cuisine: [
    'Pakistani',
    'American',
    'Continental',
    'Tibetan',
    'Cuban',
    'Japanese',
    'Spanish'
  ],
  paymentMethods: [ 'American_Express', 'VISA', 'MasterCard-Eurocard' ]
}
*/

async function setCustomer(customerId, customer) {
  const redisInstance = redisClient.getDatabase();

  // JSON stringify nested objects
  customer["cuisine"] = JSON.stringify(customer["cuisine"]);
  customer["paymentMethods"] = JSON.stringify(customer["paymentMethods"]);

  //  insert into redis
  await redisInstance.client.hSet(`customer:${customerId}`, customer);
  // set expire time to 5 mins
  await redisInstance.client.expire(`customer:${customerId}`, 300);

  return;
}

async function checkAndGetCustomer(customerId) {
  return new Promise((resolve) => {
    const redisInstance = redisClient.getDatabase();
    let returnValue = null;

    // get value from redis
    redisInstance.client.hGetAll(`customer:${customerId}`)
      .then((customer) => {
        let c = {};
        try {
          c = Object.assign({}, customer);

        } catch (error) {
          console.log("Failed to parse customer cache result");
        }
        const k = lodashKeys(c);
        if (k && k.length > 0) {
          returnValue = c;
          returnValue["cuisine"] = JSON.parse(returnValue["cuisine"]);
          returnValue["paymentMethods"] = JSON.parse(returnValue["paymentMethods"]);
        }
        resolve(returnValue);
      });
  });
}

async function deleteCustomer(customerId) {
  const redisInstance = redisClient.getDatabase();

  //  delete from redis
  await redisInstance.client.del(`customer:${customerId}`);

  return;
}

module.exports.setCustomer = setCustomer;
module.exports.checkAndGetCustomer = checkAndGetCustomer;
module.exports.deleteCustomer = deleteCustomer;