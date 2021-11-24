// const sqlite3 = require("sqlite3");
// const { open } = require("sqlite");
const { MongoClient } = require("mongodb");
const config = require("./config");

async function connect() {
  const url = config.mongo.uri;
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db("restaurant-reviews");
  const coll = db.collection("restaurantDB");
  return coll;
}

async function close() {
  const url = config.mongo.uri;
  const client = new MongoClient(url);
  await client.close();
}

async function getRestaurants(zip, name, page, pageSize) {
  const coll = await connect();
  // const stmt = await db.prepare(`
  //   SELECT * FROM Restaurant
  //   WHERE name LIKE @query AND zip LIKE @zip
  //   LIMIT @pageSize
  //   OFFSET @offset;
  //   `);l

  // const params = {
  //   "@zip": zip + "%",
  //   "@query": query + "%",
  //   "@pageSize": pageSize,
  //   "@offset": (page - 1) * pageSize,
  // };
  try {
    if (zip == null) {
      const list = await coll.find({ "name": new RegExp(name) }).skip((page - 1) * pageSize).limit(pageSize).toArray();
      return list;
    } else {
      const list = await coll.find({ "name": new RegExp(name), "zip": parseInt(zip) }).skip((page - 1) * pageSize).limit(pageSize).toArray();
      return list;
    }

  } finally {
    await close();
  }
}

async function getRestaurantCount(name, zip) {
  const coll = await connect();
  // const stmt = await db.prepare(`
  //   SELECT COUNT(*) AS count
  //   FROM Restaurant
  //   WHERE name LIKE @query;
  //   `);

  // const params = {
  //   "@query": query + "%",
  // };
  try {
    if (zip == null) {
      const count = await coll.find({ "name": new RegExp(name) }).count();
      return count;
    } else {
      const count = await coll.find({ "name": new RegExp(name), "zip": parseInt(zip) }).count();
      return count;
    }
  } finally {
    await close();
  }
}

async function viewRestaurantsByID(restID) {
  const coll = await connect();
  // const stmt = await db.prepare(`SELECT *
  //   FROM Restaurant
  //   WHERE
  //     restID = :restID
  // `);

  // stmt.bind({
  //   ":restID": restID,
  // });
  try {
    const list = await coll.find({ "restID": parseInt(restID) }).toArray();
    console.log("list", list);
    return list;
  } finally {
    await close();
  }
}

async function createRestaurant(r) {
  const coll = await connect();

  // const stmt = await db.prepare(`INSERT INTO
  //   Restaurant
  //   VALUES (:restID,:name,:address,:zip,:city,:state,:country,:dressCodeID,:priceRangeMin,:priceRangeMax,:openHours,:closeHours)
  // `);

  // stmt.bind({
  //   restID: r.restID,
  //   ":name": r.name,
  //   ":address": r.address,
  //   ":zip": r.zip,
  //   ":city": r.city,
  //   ":state": r.state,
  //   ":country": r.country,
  //   ":dressCodeID": r.dressCodeID,
  //   ":priceRangeMin": r.priceRangeMin,
  //   ":priceRangeMax": r.priceRangeMin,
  //   ":openHours": r.openHours,
  //   ":closeHours": r.closeHours,
  // });
  try {
    coll.insertOne(
      {
        "restID": await getRestaurantCount("", null) + 1,
        "name": r.name,
        "address": r.address,
        "zip": parseInt(r.zip),
        "city": r.city,
        "state": r.state,
        "country": r.country,
        "dressCode": r.dressCodeID,
        "priceRange": {
          "priceRangeMin": parseInt(r.priceRangeMin),
          "priceRangeMax": parseInt(r.priceRangeMax),
        },
        "workingHours": {
          "openHours": r.openHours,
          "closeHours": r.closeHours,
        }
      }
    );

  } finally {
    await close();
  }


}

async function updateRestaurant(r) {
  const coll = await connect();
  try {
    //   db = await connect();
    //   stmt = await db.prepare(`UPDATE 
    //   Restaurant SET
    //   restID = :restID,
    //   name=:name,
    //   address=:address,
    //   zip=:zip,
    //   city=:city,
    //   state=:state,
    //   country=:country,
    //   dressCodeID=:dressCodeID,
    //   priceRangeMin=:priceRangeMin,
    //   priceRangeMax=:priceRangeMax,
    //   openHours=:openHours,
    //   closeHours=:closeHours
    //   WHERE
    //   restID = :restID
    // `);
    //   stmt.bind({
    //     ":restID": r.restID,
    //     ":name": r.name,
    //     ":address": r.address,
    //     ":zip": r.zip,
    //     ":city": r.city,
    //     ":state": r.state,
    //     ":country": r.country,
    //     ":dressCodeID": r.dressCodeID,
    //     ":priceRangeMin": r.priceRangeMin,
    //     ":priceRangeMax": r.priceRangeMax,
    //     ":openHours": r.openHours,
    //     ":closeHours": r.closeHours,
    //   });

    coll.updateOne({ "restID": parseInt(r.restID) },
      {
        $set:
        {
          "name": r.name,
          "address": r.address,
          "zip": parseInt(r.zip),
          "city": r.city,
          "state": r.state,
          "country": r.country,
          "dressCode": r.dressCodeID,
          "priceRange.priceRangeMin": parseInt(r.priceRangeMin),
          "priceRange.priceRangeMax": parseInt(r.priceRangeMax),
          "workingHours.openHours": r.openHours,
          "workingHours.closeHours": r.closeHours,
        }
      }
    );

  } finally {
    await close();
  }
}




async function getDistinctCuisine() {
  const coll = await connect();
  try {
    const list = await coll.distinct("cuisine");
    return list;
  }
  finally {
    await close();
  }

}

async function getRestByCuisine(cuisine) {

  const coll = await connect();
  try {
    const list = await coll.find({ cuisine: cuisine }).toArray();
    return list;
  }
  finally {
    close();
  }

  //   const stmt =
  //     await db.prepare(`SELECT R.restID,R.name , R.address, R.zip , R.city, R.state, R.country from Restaurant R
  // inner join CuisineRestaurant C 
  // on C.restID = R.restID
  // inner join Cuisine F
  // on F.cuisineId = C.cuisineId
  // where 
  // cuisine LIKE :cuisine
  // ;
  //   `);

  //   stmt.bind({
  //     ":cuisine": cuisine,
  //   });
  // return await stmt.all();
}

// async function getCuisineByID(restID) {
//   const db = await connect();
//   const stmt = await db.prepare(`select C.cuisine from Cuisine C
// inner join CuisineRestaurant R
// on C.cuisineID = R.cuisineID
// where 
// R.restID = :restID;
//   `);

//   stmt.bind({
//     ":restID": restID,
//   });

//   return await stmt.all();
// }

async function deleteRestFromCuisine(restID) {
  const coll = await connect();
  // const stmt = await db.prepare(`DELETE FROM
  // 	CuisineRestaurant
  //   WHERE restID = :restID
  // `);

  // stmt.bind({
  //   ":restID": restID,
  // });
  try {
    await coll.deleteOne({ "restID": parseInt(restID) });
  }
  finally {
    close();
  }


}

module.exports.getRestaurants = getRestaurants;
module.exports.viewRestaurantsByID = viewRestaurantsByID;
module.exports.createRestaurant = createRestaurant;
module.exports.updateRestaurant = updateRestaurant;
module.exports.deleteRestFromCuisine = deleteRestFromCuisine;
// module.exports.viewWorkingDays = viewWorkingDays;
// module.exports.viewPaymentMethod = viewPaymentMethod;
// module.exports.viewFacilities = viewFacilities;
// module.exports.viewServices = viewServices;
module.exports.getRestaurantCount = getRestaurantCount;
//module.exports.getCuisineByID = getCuisineByID;
module.exports.getDistinctCuisine = getDistinctCuisine;
module.exports.getRestByCuisine = getRestByCuisine;
