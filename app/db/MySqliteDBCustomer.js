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
