let express = require("express");
let router = express.Router();

const myDB = require("../db/mySqliteDB.js");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const restaurant = await myDB.getRestaurants();
  res.render("index", { restaurants: restaurant });
});

module.exports = router;
