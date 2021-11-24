const mongoClient = require("./mongoClient");

// Function to get all customers from the Customer table without pagination
// used on the add rating page
async function getCustomersAll() {
  return new Promise((resolve, reject) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .aggregate([
        {
          "$match": {
            "customer": {
              "$nin": [
                "", null
              ]
            },
            "ratingId": {
              "$nin": [
                "", null
              ]
            }
          }
        }, {
          "$group": {
            "_id": "$customer.customerID",
            "ambience": {
              "$first": "$customer.ambience"
            },
            "budget": {
              "$first": "$customer.budget"
            },
            "id": {
              "$first": "$customer.customerID"
            },
            "drinkLevel": {
              "$first": "$customer.drinkLevel"
            },
            "name": {
              "$first": "$customer.name"
            },
            "smoker": {
              "$first": "$customer.smoker"
            },
            "dressCode": {
              "$first": "$customer.dressCode"
            },
            "cuisine": {
              "$first": "$customer.cuisine"
            },
            "paymentMethods": {
              "$first": "$customer.paymentMethods"
            }
          }
        }, {
          "$sort": {
            "name": 1
          }
        }, {
          "$project": {
            "_id": 0
          }
        }
      ])
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getCustomersAll", err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
}

// Function to get all customers from the Customer table with pagination
// used on the customers list page
async function getCustomers(page, pageSize) {

  const query = [
    {
      "$match": {
        "customer": {
          "$nin": [
            "", null
          ]
        },
        "ratingId": {
          "$nin": [
            "", null
          ]
        }
      }
    }, {
      "$group": {
        "_id": "$customer.customerID",
        "id": {
          "$first": "$customer.customerID"
        },
        "name": {
          "$first": "$customer.name"
        },
      }
    }, {
      "$sort": {
        "name": 1
      }
    }, {
      "$project": {
        "_id": 0
      }
    }
  ];


  if (pageSize) {
    query.push({ "$skip": (page - 1) * pageSize });
    query.push({ "$limit": pageSize });
  }

  return new Promise((resolve, reject) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .aggregate(query)
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getCustomersAll", err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
}

// Function to get the size of the Customer table
// used on the customers list page
async function getCustomersCount() {
  return new Promise((resolve, reject) => {

    const query = [
      {
        "$match": {
          "customer": {
            "$nin": [
              "", null
            ]
          },
          "ratingId": {
            "$nin": [
              "", null
            ]
          }
        }
      }, {
        "$group": {
          "_id": "$customer.customerID",
          "id": {
            "$first": "$customer.customerID"
          },
          "name": {
            "$first": "$customer.name"
          },
        }
      },
      {
        "$count": "id"
      }
    ];

    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .aggregate(query)
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getCustomersAll", err);
          reject(err);
        } else {
          if (docs && docs.length > 0) {
            resolve(docs[0]["id"]);
          } else {
            resolve(0);
          }
        }
      });
  });
}

// Function to get a single customer
// used for the edit page
async function getCustomer(customerId) {
  return new Promise((resolve, reject) => {

    const query = [
      {
        "$match": {
          "customer": {
            "$nin": [
              "", null
            ]
          },
          "customer.customerID": parseInt(customerId)
        }
      }, {
        "$group": {
          "_id": "$customer.customerID",
          "ambience": {
            "$first": "$customer.ambience"
          },
          "budget": {
            "$first": "$customer.budget"
          },
          "id": {
            "$first": "$customer.customerID"
          },
          "drinkLevel": {
            "$first": "$customer.drinkLevel"
          },
          "name": {
            "$first": "$customer.name"
          },
          "smoker": {
            "$first": "$customer.smoker"
          },
          "dressCode": {
            "$first": "$customer.dressCode"
          },
          "cuisine": {
            "$first": "$customer.cuisine"
          },
          "paymentMethods": {
            "$first": "$customer.paymentMethods"
          }
        }
      }, {
        "$project": {
          "_id": 0
        }
      }
    ];
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .aggregate(query)
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getCustomer", err);
          reject(err);
        } else {
          resolve(docs[0]);
        }
      });
  });
}

// Function to edit a single customer
// used for the edit customer page
async function editCustomer(customer) {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .updateMany(
        {
          "customer.customerID": customer.customerId
        },
        {
          $set: {
            "customer.ambience": customer.ambience,
            "customer.budget": customer.budget,
            "customer.drinkLevel": customer.drinkLevel,
            "customer.name": customer.name,
            "customer.smoker": customer.smoker,
            "customer.dressCode": customer.dressCode,
            "customer.cuisine": customer.cuisine,
            "customer.paymentMethods": customer.paymentMethods
          }
        }
      ).then(() => {
        resolve();
      });
  });
}

// Function to delete a single customer
// used for the delete customer button
async function deleteCustomer(customerId) {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .updateMany(
        {
          "customer.customerID": parseInt(customerId)
        },
        {
          $unset: {
            "customer": null
          }
        }
      ).then(() => {
        resolve();
      });
  });
}

// Function to get all the cuisines
// used for the add/edit customer page
async function getCuisines() {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .distinct("customer.cuisine")
      .then((docs) => {
        resolve(docs);
      });
  });
}

// Function to get all the payment methods
// used for the add/edit customer page
async function getPaymentMethods() {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .distinct("customer.paymentMethods")
      .then((docs) => {
        resolve(docs);
      });
  });
}

// Function to get all the dress codes
// used for the add/edit customer page
async function getDressCodes() {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .distinct("customer.dressCode")
      .then((docs) => {
        resolve(docs);
      });
  });
}

// Exports
module.exports.getCustomers = getCustomers;
module.exports.getCustomersAll = getCustomersAll;
module.exports.getCuisines = getCuisines;
module.exports.getPaymentMethods = getPaymentMethods;
module.exports.getDressCodes = getDressCodes;
module.exports.deleteCustomer = deleteCustomer;
module.exports.getCustomer = getCustomer;
module.exports.editCustomer = editCustomer;
module.exports.getCustomersCount = getCustomersCount;
