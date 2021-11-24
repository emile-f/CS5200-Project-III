const mongoClient = require("./mongoClient");
const ObjectId = require("mongodb").ObjectId;

async function getRatings(filter, page, pageSize) {

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
    },
    {
      "$match": {
        "cost": {
          "$gte": filter.cost
        },
        "Food": {
          "$gte": filter.food
        },
        "Service": {
          "$gte": filter.service
        },
        "parking": {
          "$gte": filter.parking
        },
        "waiting": {
          "$gte": filter.waiting
        },
        "overall": {
          "$gte": filter.overall
        }
      }
    },
    {
      $lookup: {
        from: "restaurantDB",
        localField: "restID",
        foreignField: "restID",
        as: "restaurant"
      }
    }, {
      $unwind: {
        path: "$restaurant",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      "$sort": {
        "customer.name": 1
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
          console.error("error: getRatings", err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
}

// Function to get a single rating
// used for the edit page
async function getRating(id) {
  return new Promise((resolve, reject) => {

    const query = [
      {
        "$match": {
          "_id": new ObjectId(id)
        }
      }, {
        "$lookup": {
          "from": "restaurantDB",
          "localField": "restID",
          "foreignField": "restID",
          "as": "restaurant"
        }
      }, {
        "$unwind": {
          "path": "$restaurant",
          "preserveNullAndEmptyArrays": true
        }
      }
    ];

    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .aggregate(query)
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getRatings", err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
}

// Function to get the size of the rating table with filtering
// used on the customers list page
async function getRatingsCount(filter) {
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
          },
          "cost": {
            "$gte": filter.cost
          },
          "Food": {
            "$gte": filter.food
          },
          "Service": {
            "$gte": filter.service
          },
          "parking": {
            "$gte": filter.parking
          },
          "waiting": {
            "$gte": filter.waiting
          },
          "overall": {
            "$gte": filter.overall
          }
        }
      },
      {
        "$count": "ratingId"
      }
    ];

    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .aggregate(query)
      .toArray((err, docs) => {
        if (err) {
          console.error("error: getRatingsCount", err);
          reject(err);
        } else {
          if (docs && docs.length > 0) {
            resolve(docs[0]["ratingId"]);
          } else {
            resolve(0);
          }
        }
      });
  });
}

// Function to edit a single rating
// used for the edit rating page
async function updateRating(rating) {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .updateMany(
        {
          "_id": new ObjectId(rating.ratingId)
        },
        {
          $set: {
            "restID": new ObjectId(rating.restID),
            "cost": rating.cost,
            "Food": rating.Food,
            "Service": rating.Service,
            "parking": rating.parking,
            "waiting": rating.waiting,
            "overall": rating.overall,
            "review": rating.review
          }
        }
      ).then(() => {
        resolve();
      });
  });
}

// Function to add a single rating
// used for the add rating page
async function insertRating(rating) {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .insert(rating)
      .then(() => {
        resolve();
      });
  });
}

// Function to remove a single rating
// used for the remove rating button
async function deleteRating(ratingId) {
  return new Promise((resolve) => {
    mongoClient
      .getDatabase()
      .connection.collection("Rating")
      .deleteOne(
        { "_id": new ObjectId(ratingId) }
      ).then(() => {
        resolve();
      });
  });
}

// Exports
module.exports.getRatings = getRatings;
module.exports.getRating = getRating;
module.exports.getRatingsCount = getRatingsCount;
module.exports.insertRating = insertRating;
module.exports.updateRating = updateRating;
module.exports.deleteRating = deleteRating;
