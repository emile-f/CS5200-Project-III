const { createClient } = require("redis");;
const { MongoClient } = require("mongodb");
const config = require("./config");


async function connectRedis(){
  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  return client;
};

async function close() {
  const url = config.mongo.uri;
  const client = new MongoClient(url);
  await client.close();
}

async function getRestaurants(page, pageSize) {
  const redis = await connectRedis();
  let start = (page - 1) * pageSize;
  let end = (page - 1) * pageSize + pageSize;
  let restids = await redis.LRANGE("restids",start,end);
  let restList=[];
  try{
  
    for(let id of restids){
      if(id != "NaN")
      {restList.push(await viewRestaurantsByID(id));}
    }
  }catch(e){
    console.log(e);
  }
  return restList;
}


async function getRestaurantCount() {
  const redis = await connectRedis();
  let length;
  try{
    length = await redis.LLEN("restids");
  }catch(e){
    console.log(e);
  }
  return length;
}

async function viewRestaurantsByID(restID) {
  const redis = await connectRedis();
  let rest;
  try {
  
    rest = await redis.HGETALL(`restaurant:${String(restID)}`);
  } finally {
    // await close();
  }
  return rest;
}

async function createRestaurant(r) {
  const redis = await connectRedis();
  try {
    let restid = await getRestaurantCount() + 4;
    await redis.LPUSH("restids",String(restid));
    await redis.HSET(`restaurant:${String(restid)}`,{
      name : String(r.name),
      address : String(r.address),
      city:String(r.city),
      country:String(r.country),
      restID:String(restid),
      state:String(r.state),
      zip:String(r.zip),
      priceRangeMin : String(r.priceRangeMin),
      priceRangeMax: String(r.priceRangeMax),
      openHours:String(r.openHours),
      closeHours:String(r.closeHours),
      dresscode: String(r.dresscode)
    });

  } finally {
    await close();
  }

}

async function updateRestaurant(r) {
  const redis = await connectRedis();
  try {
    await redis.HSET(`restaurant:${String(r.restID)}`,{
      name : String(r.name),
      address : String(r.address),
      city:String(r.city),
      country:String(r.country),
      restID:String(r.restID),
      state:String(r.state),
      zip:String(r.zip),
      priceRangeMin : String(r.priceRangeMin),
      priceRangeMax: String(r.priceRangeMax),
      openHours:String(r.openHours),
      closeHours:String(r.closeHours),
      dresscode: String(r.dresscode)
    });

  } finally {
    await close();
  }
}




async function getDistinctCuisine() {
  const redis = await connectRedis();
  try {
    const list = await redis.SMEMBERS("cuisines");
    return list;
  }
  finally {
    await close();
  }

}

async function getRestByCuisine(cuisine) {
  const redis = await connectRedis();
  try {
    const list = await redis.LRANGE(`cuisine:${cuisine}`,0,-1);
    let restList=[];
    for(let id of list){
      if(id != "NaN")
      {restList.push(await viewRestaurantsByID(id));}
    }
    return restList;
  }
  finally {
    close();
  }

}


async function deleteRestFromCuisine(restID) {
  const redis = await connectRedis();
  try {
    await redis.del(`restaurant:${String(restID)}`);
    let cuisine = await getDistinctCuisine();
    for(let c of cuisine){
      await redis.LREM(`cuisine:${String(c)}`,1,String(restID));
    }
    await redis.LREM("restids",1,String(restID));
  }
  catch(e) {
    console.log(e);
  }
}

async function getReviewCount() {
  const redis = await connectRedis();
  try {
    const list = await redis.zRangeWithScores("reviewCount",0,20,{
      BY: "score",
      REV: true
    }
    );
    console.log(list);
    let restList=[];
    for(let id of list){
      console.log(id);
      if(id != "NaN")
      {restList.push({"rest":await viewRestaurantsByID(id.value), "count":id.score});
      }
    }
    return restList;
  }
  catch(e) {
    console.log(e);
  }
}


module.exports.getRestaurants = getRestaurants;
module.exports.viewRestaurantsByID = viewRestaurantsByID;
module.exports.createRestaurant = createRestaurant;
module.exports.updateRestaurant = updateRestaurant;
module.exports.deleteRestFromCuisine = deleteRestFromCuisine;
module.exports.getRestaurantCount = getRestaurantCount;
module.exports.getDistinctCuisine = getDistinctCuisine;
module.exports.getRestByCuisine = getRestByCuisine;
module.exports.getReviewCount = getReviewCount;

