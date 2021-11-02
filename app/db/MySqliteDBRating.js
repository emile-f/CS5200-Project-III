const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// UPDATE NEEDED in DB SCHEMA 
// CHANGE THE customerID column from NOT NULL to allow NULL so we can set the customer ID to null when deleting customer

async function getRatings(filter, page, pageSize) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT 
        Rating.ratingId AS id,
        Restaurant.name as restaurantName, 
        Customer.name as customerName,
        Rating.cost,
        Rating.Food,
        Rating.Service,
        Rating.parking,
        Rating.waiting,
        Rating.overall,
        review.review
    FROM Rating
    left JOIN Customer on Customer.customerID=Rating.customerId
    left JOIN Restaurant on Restaurant.restID=Rating.restID
    left JOIN review on review.ratingId= Rating.ratingId
    WHERE Rating.cost >= @cost
    AND Rating.Food >= @food
    AND Rating.Service >= @service
    AND Rating.parking >= @parking
    AND Rating.waiting >= @waiting
    AND Rating.overall >= @overall
    ORDER BY Restaurant.name ASC
    LIMIT @pageSize
    OFFSET @offset;
    `);

    const params = {
        "@cost": filter.cost,
        "@food": filter.food,
        "@service": filter.service,
        "@parking": filter.parking,
        "@waiting": filter.waiting,
        "@overall": filter.overall,
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

async function getRating(id) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT 
        Rating.ratingId AS id,
        Restaurant.restID as restaurantId, 
        Customer.customerId as customerId,
        Rating.cost,
        Rating.Food,
        Rating.Service,
        Rating.parking,
        Rating.waiting,
        review.review,
        review.reviewID as reviewId
    FROM Rating
    LEFT JOIN Customer on Customer.customerID=Rating.customerId
    INNER JOIN Restaurant on Restaurant.restID=Rating.restID
    left JOIN review on review.ratingId= Rating.ratingId
    WHERE Rating.ratingId = @id
    `);

    const params = {
        "@id": id
    };

    try {
        return await stmt.all(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getRatingsCount(filter) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM Rating
    WHERE Rating.cost >= @cost
    AND Rating.Food >= @food
    AND Rating.Service >= @service
    AND Rating.parking >= @parking
    AND Rating.waiting >= @waiting
    AND Rating.overall >= @overall
    `);

    const params = {
        "@cost": filter.cost,
        "@food": filter.food,
        "@service": filter.service,
        "@parking": filter.parking,
        "@waiting": filter.waiting,
        "@overall": filter.overall,
    };

    try {
        return (await stmt.get(params)).count;
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function updateRating(rating) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    UPDATE Rating
    SET restID = @restID, 
        customerID = @customerID, 
        cost = @cost, 
        Food = @Food, 
        Service = @Service, 
        parking = @parking,
        waiting = @waiting, 
        overall = @overall
    WHERE ratingId = @id;
    `);

    const query = {
        "@restID": rating.restID,
        "@customerID": rating.customerID,
        "@cost": rating.cost,
        "@Food": rating.Food,
        "@Service": rating.Service,
        "@parking": rating.parking,
        "@waiting": rating.waiting,
        "@overall": rating.overall,
        "@id": rating.ratingId,
    };

    let reviewStmt;
    let queryReview;

    try {
        if (rating.review) {
            const t = await stmt.run(query);
            console.log('Done with update on rating table', t)
            if (!rating.reviewId) { // when not set insert
                reviewStmt = await db.prepare(`INSERT INTO
                Review(ratingId, review)
                VALUES(@id, @review);`);
                queryReview = {
                    "@id": rating.ratingId,
                    "@review": rating.review,
                };
            } else {
                reviewStmt = await db.prepare(`UPDATE Review
                SET review = @review
                WHERE reviewID = @id;`);
                queryReview = {
                    "@review": rating.review,
                    "@id": rating.reviewId,
                };
            }
            return await reviewStmt.run(queryReview);
        } else {
            return await stmt.run(query);
        }
    } finally {
        await stmt.finalize();
        if (reviewStmt) { await reviewStmt.finalize(); }
        db.close();
    }
}

async function insertRating(rating) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    INSERT INTO
        Rating(restID, customerID, cost, Food, Service, parking, waiting, overall)
    VALUES (@restID, @customerID, @cost, @Food, @Service, @parking, @waiting, @overall);
    `);

    const query = {
        "@restID": rating.restID,
        "@customerID": rating.customerID,
        "@cost": rating.cost,
        "@Food": rating.Food,
        "@Service": rating.Service,
        "@parking": rating.parking,
        "@waiting": rating.waiting,
        "@overall": rating.overall,
    };

    let reviewStmt;
    try {
        if (rating.review) {
            await stmt.run(query);
            reviewStmt = await db.prepare(`INSERT INTO
                Review(ratingId, review)
                VALUES((SELECT last_insert_rowid()), @review);`);
            const queryReview = {
                "@review": rating.review,
            };
            return await reviewStmt.run(queryReview);
        } else {
            return await stmt.run(query);
        }
    } finally {
        await stmt.finalize();
        if (reviewStmt) { await reviewStmt.finalize(); }
        db.close();
    }
}

async function deleteRating(ratingId) {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    DELETE FROM Rating
    WHERE ratingId = @id;
    `);

    const query = {
        "@id": ratingId,
    };

    let reviewStmt;
    let queryReview;

    try {
        const t = await stmt.run(query);
        console.log('Done with deleting on rating table', t)
        reviewStmt = await db.prepare(`
                DELETE FROM Review
                WHERE ratingID = @id;`);
        queryReview = {
            "@id": ratingId,
        };

        return await reviewStmt.run(queryReview);
    } finally {
        await stmt.finalize();
        if (reviewStmt) { await reviewStmt.finalize(); }
        db.close();
    }
}

module.exports.getRatings = getRatings;
module.exports.getRating = getRating;
module.exports.getRatingsCount = getRatingsCount;
module.exports.insertRating = insertRating;
module.exports.updateRating = updateRating;
module.exports.deleteRating = deleteRating;
