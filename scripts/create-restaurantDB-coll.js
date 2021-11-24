// SCRIPT FOR CREATING THE COLLECTION NAMED restaurantDB

const { MongoClient } = require("mongodb");
const config = require("./config");


async function connect() {
    const url = config.mongo.uri;
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db("restaurant-reviews");
    // const coll = db.collection("restaurantDB");
    return db;
  }
  
  async function close() {
    const url = config.mongo.uri;
    const client = new MongoClient(url);
    await client.close();
  }

  //combine the collection WorkingDays and Days to make collection workingDays
  async function createWorkingDays() {
    const db= await connect();
    const coll = db.collection("WorkingDays");

    try {
        await coll.aggregate([
           {$lookup: {
            from: 'Days',
            localField: 'daysID',
            foreignField: 'daysID',
            as: 'days'
           }}, {$unwind: {
            path: '$days'
           }}, {$set: {
            days: '$days.days'
           }}, {$group: {
            _id: '$restID',
            days: {
             $push: '$days'
            },
            restID: {
             $first: '$restID'
            }
           }}, 
           {$out: 'workingDays'}
           ])

    } finally {
      await close();
    }
  }

// Combine the payment methods with restaurant payment by the payment method id
  async function createPayment() {
    const db= await connect();
    const coll = db.collection("PaymentMethodsRestaurant");

    try {
       await coll.aggregate([
        {$lookup: {
            from: 'paymentMethods',
            localField: 'paymentMethodsID',
            foreignField: 'paymentMethodsID',
            as: 'paymentMethods'
           }}, {$unwind: {
            path: '$paymentMethods'
           }}, {$set: {
            paymentMethods: '$paymentMethods.method'
           }}, {$group: {
            _id: '$restID',
            paymentMethods: {
             $push: '$paymentMethods'
            },
            restID: {
             $first: '$restID'
            }
           }}, {$project: {
            paymentMethods: 1,
            restID: 1,
            _id: 0
           }}, {$out: 'paymentDays'}
           ])

    } finally {
      await close();
    }
  }


  // Combine cuisine with the cuisine id 
  async function createCuisine() {
    const db= await connect();
    const coll = db.collection("CuisineRestaurant");

    try {
       await coll.aggregate([
        {$lookup: {
            from: 'Cuisine',
            localField: 'cuisineId',
            foreignField: 'cuisineID',
            as: 'cuisine'
           }}, {$unwind: {
            path: '$cuisine'
           }}, {$set: {
            cuisine: '$cuisine.cuisine'
           }}, {$group: {
            _id: '$restID',
            cuisine: {
             $push: '$cuisine'
            },
            restID: {
             $first: '$restID'
            }
           }}, {$project: {
            cuisine: 1,
            restID: 1,
            _id: 0
           }}, {$out: 'cuisine'}
           ])

    } finally {
      await close();
    }
  }

  //CREATE THE FINAL RESTAURANT COLLECTION



  async function createRestaurantDB() {
    const db= await connect();
    const coll = db.collection("Restaurant");

    createWorkingDays();
    createPayment();
    createCuisine();


    try {
       const res = await coll.aggregate([
        {$lookup: {
            from: 'dressCode',
            localField: 'dressCodeID',
            foreignField: 'dressCodeID',
            as: 'dressCodeID'
           }}, {$lookup: {
            from: 'facilities',
            localField: 'restID',
            foreignField: 'restID',
            as: 'facilities',
            pipeline: [
             {
              $project: {
               _id: 0,
               parkingSpace: 1,
               ambience: 1,
               seatingArea: 1
              }
             }
            ]
           }}, {$lookup: {
            from: 'services',
            localField: 'restID',
            foreignField: 'restID',
            as: 'services',
            pipeline: [
             {
              $project: {
               _id: 0,
               alcohol: 1,
               smoking: 1,
               seatingArea: 1
              }
             }
            ]
           }}, {$lookup: {
            from: 'workingDays',
            localField: 'restID',
            foreignField: 'restID',
            as: 'workingDays'
           }}, {$lookup: {
            from: 'paymentDays',
            localField: 'restID',
            foreignField: 'restID',
            as: 'payments',
            pipeline: [
             {
              $project: {
               _id: 0,
               paymentMethods: 1
              }
             }
            ]
           }}, {$lookup: {
            from: 'cuisine',
            localField: 'restID',
            foreignField: 'restID',
            as: 'cuisine'
           }}, {$unwind: {
            path: '$cuisine'
           }}, {$set: {
            workingDays: '$workingDays.days',
            cuisine: '$cuisine.cuisine'
           }}, {$unwind: {
            path: '$dressCodeID'
           }}, {$unwind: {
            path: '$facilities'
           }}, {$unwind: {
            path: '$workingDays'
           }}, {$unwind: {
            path: '$payments'
           }}, {$unwind: {
            path: '$services'
           }}, {$set: {
            payments: '$payments.paymentMethods',
            priceRange: {
             priceRangeMin: '$priceRangeMin',
             priceRangeMax: '$priceRangeMax'
            },
            workingHours: {
             openHours: '$openHours',
             closeHours: '$closeHours'
            },
            dressCode: '$dressCodeID.dressCode'
           }}, {$project: {
            dressCodeID: 0,
            priceRangeMax: 0,
            priceRangeMin: 0,
            openHours: 0,
            closeHours: 0
           }}])
    } finally {
      await close();
    }
  }