//1.One query must contain an aggregation :

db.restaurantsDB.aggregate([{$match: {
    country: 'Mexico'
   }}, {$sort: {
    'priceRange.priceRangeMax': -1
   }}, {$limit: 10}]).toArray();
   
   //2. One must contain a complex search criterion (more than one expression with logical connectors)
   
   db.restaurantsDB.aggregate([{$match: {
    $or: [
     {
      'priceRange.priceRangeMin': {
       $gt: 10
      }
     },
     {
      'priceRange.priceRangeMax': {
       $lt: 30
      }
     }
    ]
   }}, {$match: {
    dressCode: {
     $in: [
      'formal',
      'elegant'
     ]
    }
   }}]).toArray();
   
   //3.  one should be counting documents for an specific user
   
   db.restaurantsDB.find({"name":new RegExp(query_param), "zip":parseInt(zip)}).count();
   
   //4.  One must be updating a document based on a query parameter
   
      db.restaurantsDB.updateOne({"restID" : parseInt(r.restID)},
         {$set:
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
   
   
   //5. Insert Query
   
   db.restaurantsDB.insertOne(
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