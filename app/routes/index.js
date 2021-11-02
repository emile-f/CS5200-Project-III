let express = require("express");
let router = express.Router();

const customerRoute = require("./customer");
const ratingRoute = require("./rating");

/* GET home page. */
router.get("/", async function (req, res) {
  res.render("index");
});

router.use("/customer", customerRoute);
router.use("/rating", ratingRoute);

module.exports = router;
