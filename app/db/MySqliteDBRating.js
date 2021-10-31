const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

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
    INNER JOIN Customer on Customer.customerID=Rating.customerId
    INNER JOIN Restaurant on Restaurant.restID=Rating.restID
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

module.exports.getRatings = getRatings;
module.exports.getRatingsCount = getRatingsCount;
