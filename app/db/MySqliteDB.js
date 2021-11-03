const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getRestaurants() {
  const db = await open({
    filename: "./db/restaurant.db",
    driver: sqlite3.Database,
  });
  return await db.all("SELECT * FROM Restaurant LIMIT 20");
}

module.exports.getRestaurants = getRestaurants;
