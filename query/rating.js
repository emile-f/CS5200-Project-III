// At least one query must contain and aggregation

const queryAgg = [
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

new Promise((resolve, reject) => {
  mongoClient
    .getDatabase()
    .connection.collection("Rating")
    .aggregate(queryAgg)
    .toArray((err, docs) => {
      if (err) {
        console.error("error: getCustomersAll", err);
        reject(err);
      } else {
        resolve(docs);
      }
    });
});

// one must contain a complex search criterion (more than one expression with logical connectors)

const queryAgg2 = [
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

queryAgg2.push({ "$skip": (page - 1) * pageSize });
queryAgg2.push({ "$limit": pageSize });

new Promise((resolve, reject) => {
  mongoClient
    .getDatabase()
    .connection.collection("Rating")
    .aggregate(queryAgg2)
    .toArray((err, docs) => {
      if (err) {
        console.error("error: getRatings", err);
        reject(err);
      } else {
        resolve(docs);
      }
    });
});

// one should be counting documents for an specific user

const queryAgg3 = [
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

new Promise((resolve, reject) => {
  mongoClient
    .getDatabase()
    .connection.collection("Rating")
    .aggregate(queryAgg3)
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

// and one must be updating a document based on a query parameter (e.g. flipping on or off a boolean attribute for a document, such as enabling/disabling a song)

new Promise((resolve) => {
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

// insert into database

new Promise((resolve) => {
  mongoClient
    .getDatabase()
    .connection.collection("Rating")
    .insert({
      "Food": 5,
      "Service": 3,
      "cost": 3,
      "overall": 3.6,
      "parking": 3,
      "ratingId": 2,
      "restID": 225,
      "waiting": 4,
      "customer": {
        "ambience": "friends",
        "budget": "low",
        "customerID": 162,
        "drinkLevel": "casual drinker",
        "name": "Carola Gras",
        "smoker": false,
        "dressCode": "no preference",
        "cuisine": [
          "Tibetan",
          "Singapore",
          "American",
          "French",
          "Vietnamese",
          "Lebanese",
          "Continental",
          "Malaysian",
          "Spanish",
          "Russian",
          "Pakistani",
          "Indian",
          "Thai",
          "Japanese",
          "Cuban",
          "Greek",
          "Indonesian",
          "Mexican",
          "Italian"
        ],
        "paymentMethods": [
          "MasterCard-Eurocard",
          "bank_debit_cards",
          "American_Express",
          "VISA"
        ]
      },
      "review": "Just spicy enough.. Perfect actually."
    })
    .then(() => {
      resolve();
    });
});
