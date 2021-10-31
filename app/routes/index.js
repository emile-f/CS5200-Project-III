let express = require("express");
let router = express.Router();

const myDB = require("../db/mySqliteDB.js");

const customerRoute = require('./customer');
const ratingRoute = require('./rating');

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.render("index");
});

router.use('/customer', customerRoute)
router.use('/rating', ratingRoute)

module.exports = router;
