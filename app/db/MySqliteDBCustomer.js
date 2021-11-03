const util = require("./util");

// Function to get all customers from the Customer table without pagination
// used on the add rating page
async function getCustomersAll() {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    SELECT name,customerId as id FROM Customer
    ORDER BY name ASC`);

  try {
    return await stmt.all();
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// Function to get all customers from the Customer table with pagination
// used on the customers list page
async function getCustomers(page, pageSize) {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    SELECT name,customerId as id FROM Customer
    ORDER BY name ASC
    LIMIT @pageSize
    OFFSET @offset`);

  const params = {
    "@pageSize": pageSize,
    "@offset": (page - 1) * pageSize
  };

  try {
    return await stmt.all(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// Function to get the size of the Customer table
// used on the customers list page
async function getCustomersCount() {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM Customer`);

  try {
    return (await stmt.get()).count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// Function to get a single customer
// used for the edit page
async function getCustomer(customerId) {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    SELECT 
        Customer.customerId,  
        Customer.name,  
        Customer.smoker,
        Customer.drinkLevel,
        Customer.ambience,
        Customer.dressCodeID,
        Customer.budget,
        GROUP_CONCAT(DISTINCT CuisineCustomer.cuisineId) as cuisines,
        GROUP_CONCAT(DISTINCT PaymentMethodsCustomer.paymentMethodsID) as paymentMethods
    FROM Customer
    INNER join CuisineCustomer on CuisineCustomer.customerId=Customer.customerId
    INNER join PaymentMethodsCustomer on PaymentMethodsCustomer.customerId=Customer.customerId
    WHERE Customer.customerId = @id`);

  const query = {
    "@id": customerId,
  };

  try {
    return await stmt.all(query);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// Function to add a single customer
// used for the add customer page
async function insertCustomer(customer) {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    INSERT INTO Customer(name, smoker, drinkLevel, dressCodeID, ambience, budget)
    VALUES (@name, @smoker, @drinkLevel, @dressCodeID, @ambience, @budget)`);

  const paymentStmt = await db.prepare(`
    INSERT INTO PaymentMethodsCustomer(customerId,paymentMethodsID)
    VALUES (@customerId, @paymentMethodsID)`);

  const cuisineStmt = await db.prepare(`
    INSERT INTO CuisineCustomer(customerId,cuisineId)
    VALUES (@customerId, @cuisineId)`);

  const query = {
    "@name": customer.name,
    "@smoker": customer.smoker,
    "@drinkLevel": customer.drinkLevel,
    "@dressCodeID": customer.dressCodeID,
    "@ambience": customer.ambience,
    "@budget": customer.budget
  };

  const paymentMethodQueries = [];
  for (let index = 0; index < customer.paymentMethods.length; index++) {
    paymentMethodQueries.push({
      "@customerId": null,
      "@paymentMethodsID": parseInt(customer.paymentMethods[index])
    });
  }

  const cuisineQueries = [];
  for (let index = 0; index < customer.cuisines.length; index++) {
    cuisineQueries.push({
      "@customerId": null,
      "@cuisineId": parseInt(customer.cuisines[index])
    });
  }

  try {

    // insert customer
    // get the row id of the just inserted customer
    let returnId = await stmt.run(query);
    if (returnId && returnId.lastID) {
      returnId = returnId.lastID;
    } else {
      return;
    }

    // prepare paymentMethods
    for (let index = 0; index < paymentMethodQueries.length; index++) {
      paymentMethodQueries[index]["@customerId"] = returnId;
    }

    // prepare cuisines
    for (let index = 0; index < cuisineQueries.length; index++) {
      cuisineQueries[index]["@customerId"] = returnId;
    }

    // insert paymentMethods
    for (let index = 0; index < paymentMethodQueries.length; index++) {
      await paymentStmt.run(paymentMethodQueries[index]);
    }

    // insert cuisines
    for (let index = 0; index < cuisineQueries.length; index++) {
      await cuisineStmt.run(cuisineQueries[index]);
    }

    return;
  } finally {
    await stmt.finalize();
    await paymentStmt.finalize();
    await cuisineStmt.finalize();
    db.close();
  }
}


// Function to edit a single customer
// used for the edit customer page
async function editCustomer(customer) {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    UPDATE Customer
    SET name = @name,
        smoker = @smoker,
        drinkLevel = @drinkLevel,
        dressCodeID =  @dressCodeID,
        ambience = @ambience,
        budget = @budget
    WHERE customerId = @id`);

  const query = {
    "@id": customer.customerId,
    "@name": customer.name,
    "@smoker": customer.smoker,
    "@drinkLevel": customer.drinkLevel,
    "@dressCodeID": customer.dressCodeID,
    "@ambience": customer.ambience,
    "@budget": customer.budget
  };

  // Prepare added paymentMethods
  const paymentMethodQueriesAdded = [];
  for (let index = 0; index < customer.addedPayments.length; index++) {
    paymentMethodQueriesAdded.push({
      "@customerId": customer.customerId,
      "@paymentMethodsID": parseInt(customer.addedPayments[index])
    });
  }

  // Prepare removed paymentMethods
  const paymentMethodQueriesRemoved = [];
  for (let index = 0; index < customer.removedPayments.length; index++) {
    paymentMethodQueriesRemoved.push({
      "@customerId": customer.customerId,
      "@paymentMethodsID": parseInt(customer.removedPayments[index])
    });
  }

  // prepare added cuisines
  const cuisineQueriesAdded = [];
  for (let index = 0; index < customer.addedCuisine.length; index++) {
    cuisineQueriesAdded.push({
      "@customerId": customer.customerId,
      "@cuisineId": parseInt(customer.addedCuisine[index])
    });
  }

  // prepare removed cuisines
  const cuisineQueriesRemoved = [];
  for (let index = 0; index < customer.removedCuisine.length; index++) {
    cuisineQueriesRemoved.push({
      "@customerId": customer.customerId,
      "@cuisineId": parseInt(customer.removedCuisine[index])
    });
  }

  // update customer
  try {
    await stmt.run(query);
  } finally {
    await stmt.finalize();
  }

  const paymentStmtAdded = await db.prepare(`
    INSERT INTO
        PaymentMethodsCustomer(customerId,paymentMethodsID)
    VALUES (@customerId, @paymentMethodsID)`);

  try {
    // insert paymentMethods
    for (let index = 0; index < paymentMethodQueriesAdded.length; index++) {
      await paymentStmtAdded.run(paymentMethodQueriesAdded[index]);
    }
  } finally {
    await paymentStmtAdded.finalize();
  }


  const paymentStmtDelete = await db.prepare(`
    DELETE FROM PaymentMethodsCustomer
    WHERE customerId = @customerId AND paymentMethodsID = @paymentMethodsID`);

  try {
    // remove paymentMethods
    for (let index = 0; index < paymentMethodQueriesRemoved.length; index++) {
      await paymentStmtDelete.run(paymentMethodQueriesRemoved[index]);
    }
  } finally {
    await paymentStmtDelete.finalize();
  }

  const cuisineStmtDelete = await db.prepare(`
    DELETE FROM CuisineCustomer
    WHERE customerId = @customerId AND cuisineId = @cuisineId`);

  try {
    // remove cuisines
    for (let index = 0; index < cuisineQueriesRemoved.length; index++) {
      await cuisineStmtDelete.run(cuisineQueriesRemoved[index]);
    }
  } finally {
    await cuisineStmtDelete.finalize();
  }

  const cuisineStmtAdded = await db.prepare(`
    INSERT INTO
    CuisineCustomer(customerId,cuisineId)
    VALUES (@customerId, @cuisineId)`);

  try {
    // insert cuisines
    for (let index = 0; index < cuisineQueriesAdded.length; index++) {
      await cuisineStmtAdded.run(cuisineQueriesAdded[index]);
    }
  } finally {
    await cuisineStmtAdded.finalize();
  }

  await db.close();
  return;
}

// Function to delete a single customer
// used for the delete customer button
async function deleteCustomer(customerId) {
  const db = await util.getDatabase();

  // Update Rating and set the customerId to NULL
  // this is needed so we can keep ratings for delete users
  const ratingStmt = await db.prepare(`
    UPDATE Rating
    SET customerID = NULL
    WHERE customerID = @id`);

  const customerStmt = await db.prepare(`
    DELETE FROM Customer
    WHERE customerID = @id`);

  const paymentStmt = await db.prepare(`
    DELETE FROM PaymentMethodsCustomer
    WHERE customerId = @id`);

  const cuisineStmt = await db.prepare(`
    DELETE FROM CuisineCustomer
    WHERE customerId = @id`);

  const query = {
    "@id": customerId,
  };

  try {
    await ratingStmt.run(query);
    await customerStmt.run(query);
    await paymentStmt.run(query);
    await cuisineStmt.run(query);
    return;
  } finally {
    await ratingStmt.finalize();
    await customerStmt.finalize();
    await paymentStmt.finalize();
    await cuisineStmt.finalize();
    db.close();
  }
}

// Function to get all the cuisines
// used for the add/edit customer page
async function getCuisines() {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    SELECT * FROM Cuisine
    ORDER BY cuisine`);

  try {
    return await stmt.all();
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// Function to get all the payment methods
// used for the add/edit customer page
async function getPaymentMethods() {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    SELECT * FROM PaymentMethods
    ORDER BY method`);

  try {
    return await stmt.all();
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// Function to get all the dress codes
// used for the add/edit customer page
async function getDressCodes() {
  const db = await util.getDatabase();

  const stmt = await db.prepare(`
    SELECT * FROM DressCode
    ORDER BY dressCode
    `);

  try {
    return await stmt.all();
  } finally {
    await stmt.finalize();
    db.close();
  }
}

// Exports
module.exports.getCustomers = getCustomers;
module.exports.getCustomersAll = getCustomersAll;
module.exports.getCuisines = getCuisines;
module.exports.getPaymentMethods = getPaymentMethods;
module.exports.getDressCodes = getDressCodes;
module.exports.insertCustomer = insertCustomer;
module.exports.deleteCustomer = deleteCustomer;
module.exports.getCustomer = getCustomer;
module.exports.editCustomer = editCustomer;
module.exports.getCustomersCount = getCustomersCount;
