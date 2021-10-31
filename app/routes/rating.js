let express = require("express");
let router = express.Router();

const myDB = require("../db/MySqliteDBRating");

/* GET home page. */
router.get("/", async function (req, res, next) {

    const filter = {
        cost: req.query.cost || 0,
        food: req.query.food || 0,
        service: req.query.service || 0,
        parking: req.query.parking || 0,
        waiting: req.query.waiting || 0,
        overall: req.query.overall || 0
    }

    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 24;

    try {
        let total = await myDB.getRatingsCount(filter);

        


        const ratings = await myDB.getRatings(filter, page, pageSize);
        res.render("ratings", { filter, ratings, currentPage: page, lastPage: Math.ceil(total / pageSize), });
    } catch (err) {
        next(err);
    }

});

module.exports = router;
