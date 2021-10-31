const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getRestaurants() {
    const db = await open({
        filename: "./db/database.db",
        driver: sqlite3.Database,
    });

    // add some address info so we can see the difference when its is branch
    const stmt = await db.prepare(`
    SELECT name,restId as id FROM Restaurant
    ORDER BY name ASC
    `);

    try {
        return await stmt.all();
    } finally {
        await stmt.finalize();
        db.close();
    }
}

module.exports.getRestaurants = getRestaurants;
