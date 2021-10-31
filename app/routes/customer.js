let express = require("express");
let router = express.Router();

const myDB = require("../db/MySqliteDBCustomer");

/* GET home page. */
router.get("/", async function (req, res, next) {
    const customers = await myDB.getCustomers();
    res.render("customers", { customers });
});

module.exports = router;
