const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getCustomers() {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT name,customerId as id FROM Customer
    ORDER BY name ASC
    `);

    try {
        return await stmt.all();
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getCustomer(customerId) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

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
    WHERE Customer.customerId = @id
    `);

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

async function insertCustomer(customer) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    INSERT INTO
        Customer(name, smoker, drinkLevel, dressCodeID, ambience, budget)
    VALUES (@name, @smoker, @drinkLevel, @dressCodeID, @ambience, @budget);
    `);

    const paymentStmt = await db.prepare(`
    INSERT INTO
        PaymentMethodsCustomer(customerId,paymentMethodsID)
    VALUES (@customerId, @paymentMethodsID);
    `);


    const cuisineStmt = await db.prepare(`
    INSERT INTO
    CuisineCustomer(customerId,cuisineId)
    VALUES (@customerId, @cuisineId);
    `);

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
        let returnId = await stmt.run(query);
        if (returnId && returnId.lastID) {
            returnId = returnId.lastID;
        } else {
            return
        }

        // prepare paymentMethods
        for (let index = 0; index < paymentMethodQueries.length; index++) {
            paymentMethodQueries[index]['@customerId'] = returnId;
        }

        // prepare cuisines
        for (let index = 0; index < cuisineQueries.length; index++) {
            cuisineQueries[index]['@customerId'] = returnId;
        }

        // insert paymentMethods
        for (let index = 0; index < paymentMethodQueries.length; index++) {
            await paymentStmt.run(paymentMethodQueries[index]);
        }

        for (let index = 0; index < cuisineQueries.length; index++) {
            await cuisineStmt.run(cuisineQueries[index]);
        }

        return 'done'
    } finally {
        await stmt.finalize();
        await paymentStmt.finalize();
        await cuisineStmt.finalize();
        db.close();
    }
}

async function editCustomer(customer) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    UPDATE Customer
    SET name = @name,
        smoker = @smoker,
        drinkLevel = @drinkLevel,
        dressCodeID =  @dressCodeID,
        ambience = @ambience,
        budget = @budget
    WHERE customerId = @id;
    `);

    const paymentStmtAdded = await db.prepare(`
    INSERT INTO
        PaymentMethodsCustomer(customerId,paymentMethodsID)
    VALUES (@id, @paymentMethodsID);
    `);

    const paymentStmtDelete = await db.prepare(`
    DELETE FROM PaymentMethodsCustomer
    WHERE customerId = @id AND paymentMethodsID = @paymentId;
    `);

    const cuisineStmtAdded = await db.prepare(`
    INSERT INTO
    CuisineCustomer(customerId,cuisineId)
    VALUES (@id, @cuisineId);
    `);

    const cuisineStmtDelete = await db.prepare(`
    DELETE FROM CuisineCustomer
    WHERE customerId = @id AND cuisineId = @cuisineId;
    `);

    const query = {
        "@id": customer.customerId,
        "@name": customer.name,
        "@smoker": customer.smoker,
        "@drinkLevel": customer.drinkLevel,
        "@dressCodeID": customer.dressCodeID,
        "@ambience": customer.ambience,
        "@budget": customer.budget
    };

    const paymentMethodQueriesAdded = [];
    for (let index = 0; index < customer.addedPayments.length; index++) {
        console.log('add', {
            "@id": customer.customerId,
            "@paymentMethodsID": parseInt(customer.addedPayments[index])
        });
        paymentMethodQueriesAdded.push({
            "@id": customer.customerId,
            "@paymentMethodsID": parseInt(customer.addedPayments[index])
        });
    }

    const paymentMethodQueriesRemoved = [];
    for (let index = 0; index < customer.removedPayments.length; index++) {
        console.log('remove', {
            "@id": customer.customerId,
            "@paymentMethodsID": parseInt(customer.removedPayments[index])
        });
        paymentMethodQueriesRemoved.push({
            "@id": customer.customerId,
            "@paymentMethodsID": parseInt(customer.removedPayments[index])
        });
    }

    const cuisineQueriesAdded = [];
    for (let index = 0; index < customer.addedCuisine.length; index++) {
        cuisineQueriesAdded.push({
            "@id": customer.customerId,
            "@cuisineId": parseInt(customer.addedCuisine[index])
        });
    }

    const cuisineQueriesRemoved = [];
    for (let index = 0; index < customer.removedCuisine.length; index++) {
        cuisineQueriesRemoved.push({
            "@id": customer.customerId,
            "@cuisineId": parseInt(customer.removedCuisine[index])
        });
    }

    try {
        // update customer
        await stmt.run(query);
        console.log('done updating customer table');

        // remove paymentMethods
        for (let index = 0; index < paymentMethodQueriesRemoved.length; index++) {
            await paymentStmtDelete.run(paymentMethodQueriesRemoved[index]);
        }
        console.log('done removing paymentMethods');

        // insert paymentMethods
        for (let index = 0; index < paymentMethodQueriesAdded.length; index++) {
            await paymentStmtAdded.run(paymentMethodQueriesAdded[index]);
        }
        console.log('done inserting paymentMethods');

        // remove cuisines
        for (let index = 0; index < cuisineQueriesRemoved.length; index++) {
            await cuisineStmtDelete.run(cuisineQueriesRemoved[index]);
        }
        console.log('done removing cuisines');

        // insert cuisines
        for (let index = 0; index < cuisineQueriesAdded.length; index++) {
            await cuisineStmtAdded.run(cuisineQueriesAdded[index]);
        }
        console.log('done inserting cuisines');

        return 'done'
    } finally {
        await stmt.finalize();
        await paymentStmtAdded.finalize();
        await paymentStmtDelete.finalize();
        await cuisineStmtAdded.finalize();
        await cuisineStmtDelete.finalize();
        db.close();
    }
}

async function deleteCustomer(customerId) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    DELETE FROM Customer
    WHERE customerID = @id;
    `);

    const paymentStmt = await db.prepare(`
    DELETE FROM PaymentMethodsCustomer
    WHERE customerId = @id;
    `);


    const cuisineStmt = await db.prepare(`
    DELETE FROM CuisineCustomer
    WHERE customerId = @id;
    `);


    const query = {
        "@id": customerId,
    };

    try {
        await stmt.run(query);
        await paymentStmt.run(query);
        await cuisineStmt.run(query);
        return 'done'
    } finally {
        await stmt.finalize();
        await paymentStmt.finalize();
        await cuisineStmt.finalize();
        db.close();
    }
}

async function getCuisines() {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT * FROM Cuisine
    ORDER BY cuisine
    `);

    try {
        return await stmt.all();
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getPaymentMethods() {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT * FROM PaymentMethods
    ORDER BY method
    `);

    try {
        return await stmt.all();
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getDressCodes() {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

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

module.exports.getCustomers = getCustomers;
module.exports.getCuisines = getCuisines;
module.exports.getPaymentMethods = getPaymentMethods;
module.exports.getDressCodes = getDressCodes;
module.exports.insertCustomer = insertCustomer;
module.exports.deleteCustomer = deleteCustomer;
module.exports.getCustomer = getCustomer;
module.exports.editCustomer = editCustomer;
