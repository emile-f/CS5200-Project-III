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

module.exports.getCustomers = getCustomers;
