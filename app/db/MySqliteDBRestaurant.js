const sqlite3 = require("sqlite3");
const { open } = require("sqlite");


async function getDatabase() {
  return open({
    filename: "./db/database.db",
    driver: sqlite3.Database,
  });
}

// Function to get all restaurants
// used on the edit/add rating page
async function getRestaurants() {
  const db = await getDatabase();

  // add some address info so we can see the difference when its is branch
  const stmt = await db.prepare(`
    SELECT name,restId as id FROM Restaurant
    ORDER BY name ASC`);

  try {
    return await stmt.all();
  } finally {
    await stmt.finalize();
    db.close();
  }
}

module.exports.getRestaurants = getRestaurants;
