const util = require("./util");

// Function to get all restaurants
// used on the edit/add rating page
async function getRestaurants() {
  const db = await util.getDatabase();

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
