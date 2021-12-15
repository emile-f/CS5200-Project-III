const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function connectRedis(){
  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  return client;
};

async function connectMongo(){
  const url = "mongodb://localhost:27017";
  const client = new MongoClient(url);
  await client.connect();
  return client;

};

//HASHES TO STORE PROPERTY OF ALL RESTURANTS
async function makeHashes() {

  let client;

  try{
    client = await connectMongo();
    const db = client.db("restaurant-reviews");
    const coll = db.collection("restaurantsDB");
    const redis = await connectRedis();
    const tweetlist = await coll.find().toArray();
    try{
      for (var i=0; i<tweetlist.length; i++) {
        const isFacilities = tweetlist[i].facilities? true:false;
        if(isFacilities){
          await redis.HSET(`restaurant:${String(tweetlist[i].restID)}`,{
            name : String(tweetlist[i].name),
            address : String(tweetlist[i].address),
            city:String(tweetlist[i].city),
            country:String(tweetlist[i].country),
            restID:String(tweetlist[i].restID),
            state:String(tweetlist[i].state),
            zip:String(tweetlist[i].zip),
            facilities_ambience: String(tweetlist[i].facilities.ambience),
            facilities_parkingSpace : String(tweetlist[i].facilities.parkingSpace),
            facilities_seatingArea : String(tweetlist[i].facilities.seatingArea),
            services_alcohol:String(tweetlist[i].services.alcohol),
            services_smoking:String(tweetlist[i].services.smoking),
            workingDays:String(tweetlist[i].workingDays),
            payments:String(tweetlist[i].payments),
            cuisine: String(tweetlist[i].cuisine),
            priceRangeMin : String(tweetlist[i].priceRange.priceRangeMin),
            priceRangeMax: String(tweetlist[i].priceRange.priceRangeMax),
            openHours:String(tweetlist[i].workingHours.openHours),
            closeHours:String(tweetlist[i].workingHours.closeHours),
            dresscode: String(tweetlist[i].dressCode)
          });
        } else{
          await redis.HSET(`restaurant:${String(tweetlist[i].restID)}`,{
            name : String(tweetlist[i].name),
            address : String(tweetlist[i].address),
            city:String(tweetlist[i].city),
            country:String(tweetlist[i].country),
            restID:String(tweetlist[i].restID),
            state:String(tweetlist[i].state),
            zip:String(tweetlist[i].zip),
            priceRangeMin : String(tweetlist[i].priceRange.priceRangeMin),
            priceRangeMax: String(tweetlist[i].priceRange.priceRangeMax),
            openHours:String(tweetlist[i].workingHours.openHours),
            closeHours:String(tweetlist[i].workingHours.closeHours),
            dresscode: String(tweetlist[i].dresscode)
          });
        }

      }
    }catch(e){
      console.log(e);
    }

  }finally{
    await client.close();
  }

}


//LIST TO STORE ALL THE RESTAURANT IDS

async function getAllRestID(){
  let client;
  try{
    client = await connectMongo();
    const db = client.db("restaurant-reviews");
    const coll = db.collection("restaurantsDB");
    const redis = await connectRedis();
    try{
      const list = await coll.aggregate([
        {
          "$project": {
            "restID": 1, 
            "_id": 0
          }
        }
      ]).toArray();


      for(let l of list){
        await redis.LPUSH("restids",String(l.restID));
      }
     
    }catch(e){
      console.log(e);
    }
      
  } finally {
    await client.close();
  }

}



// set to store all restaurants of a particular kind of cuisine
async function restaurantCuisine(){
  let client;
  try{
    client = await connectMongo();
    const db = client.db("restaurant-reviews");
    const coll = db.collection("restaurantsDB");
    const redis = await connectRedis();
    try{
      const list = await coll.aggregate([
        {
          "$project": {
            "restID": 1, 
            "cuisine": 1, 
            "_id": 0
          }
        }
      ]).toArray();


      for(let l of list){
  
    
        if(l.cuisine != null){
          if(l.cuisine.includes("American")){
            await redis.LPUSH("cuisine:American",String(l.restID));
          }
          if(l.cuisine.includes("Chinese")){
            await redis.LPUSH("cuisine:Chinese",String(l.restID));
          }
          if(l.cuisine.includes("Continental")){
            await redis.LPUSH("cuisine:Continental",String(l.restID));
          }
          if(l.cuisine.includes("Cuban")){
            await redis.LPUSH("cuisine:Cuban",String(l.restID));
          }
          if(l.cuisine.includes("French")){
            await redis.LPUSH("cuisine:French",String(l.restID));
          }
          if(l.cuisine.includes("Greek")){
            await redis.LPUSH("cuisine:Greek",String(l.restID));
          }
          if(l.cuisine.includes("Indian")){
            await redis.LPUSH("cuisine:Indian",String(l.restID));
          }
          if(l.cuisine.includes("Indonesian")){
            await redis.LPUSH("cuisine:Indonesian",String(l.restID));
          }
          if(l.cuisine.includes("Italian")){
            await redis.LPUSH("cuisine:Italian",String(l.restID));
          }
          if(l.cuisine.includes("Japanese")){
            await redis.LPUSH("cuisine:Japanese",String(l.restID));
          }
          if(l.cuisine.includes("Lebanese")){
            await redis.LPUSH("cuisine:Lebanese",String(l.restID));
          }
          if(l.cuisine.includes("Malaysian")){
            await redis.LPUSH("cuisine:Malaysian",String(l.restID));
          }
          if(l.cuisine.includes("Mexican")){
            await redis.LPUSH("cuisine:Mexican",String(l.restID));
          }
          if(l.cuisine.includes("Pakistani")){
            await redis.LPUSH("cuisine:Pakistani",String(l.restID));
          }
          if(l.cuisine.includes("Russian")){
            await redis.LPUSH("cuisine:Russian",String(l.restID));
          }
          if(l.cuisine.includes("Singapore")){
            await redis.LPUSH("cuisine:Singapore",String(l.restID));
          }
          if(l.cuisine.includes("Spanish")){
            await redis.LPUSH("cuisine:Spanish",String(l.restID));
          }
          if(l.cuisine.includes("Thai")){
            await redis.LPUSH("cuisine:Thai",String(l.restID));
          }
          if(l.cuisine.includes("Tibetan")){
            await redis.LPUSH("cuisine:Tibetan",String(l.restID));
          }
        }

      }
     
    }catch(e){
      console.log(e);
    }
      
  } finally {
    await client.close();
  }
}

//set to store all the different types of cuisines
async function getCuisines(){
  let client;
  try{
    client = await connectMongo();
    const db = client.db("restaurant-reviews");
    const coll = db.collection("restaurantsDB");
    const redis = await connectRedis();
    try{
      const list = await coll.distinct("cuisine");
      for(let l of list){
        await redis.SADD("cuisines",String(l));
      }
     
    }catch(e){
      console.log(e);
    }
      
  } finally {
    await client.close();
  }

}


//sorted set to store the count of reviews a restarant has received
async function countRating(){
  let client;
  try{
    client = await connectMongo();
    const db = client.db("restaurant-reviews");
    const coll = db.collection("Rating");
    const redis = await connectRedis();
    try{
      const list = await coll.aggregate([
        {
          "$group": {
            "_id": "$restID", 
            "restID": {
              "$first": "$restID"
            }, 
            "count": {
              "$sum": 1
            }
          }
        }, {
          "$project": {
            "_id": 0
          }
        }
      ]).toArray();

      for(let l of list){

        await redis.ZADD("reviewCount",{score:String(l.count),value:String(l.restID)});
      }
     
    }catch(e){
      console.log(e);
    }
      
  } finally {
    await client.close();
  }

}

//sorted set to store the count of reviews a restarant has received
async function customerRating(){
  let client;
  try{
    client = await connectMongo();
    const db = client.db("restaurant-reviews");
    const coll = db.collection("Rating");
    const redis = await connectRedis();
    try{
      const list = await coll.aggregate([
        {
          "$group": {
            "_id": "$customer.customerID", 
            "customer": {
              "$first": "$customer"
            }, 
            "count": {
              "$sum": 1
            }
          }
        }
      ]).toArray();

      for(let l of list){
        if(l.customer != null)
        {
          await redis.ZADD("customerRatingCount",{score:String(l.count),
            value:String(l.customer.name)});
        }
      }
     
    }catch(e){
      console.log(e);
    }
      
  } finally {
    await client.close();
  }

}


//module.exports.query = query;
makeHashes();
getAllRestID();
restaurantCuisine();
getCuisines();
countRating();
customerRating();

