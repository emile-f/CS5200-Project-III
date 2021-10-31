let express = require("express");
let router = express.Router();

const myDB = require("../db/MySqliteDBRating");
const myDBCustomer = require("../db/MySqliteDBCustomer");
const myDBRestaurant = require("../db/MySqliteDBRestaurant");

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

router.get("/add", async function (req, res, next) {
    const customers = await myDBCustomer.getCustomers();
    const restaurants = await myDBRestaurant.getRestaurants();
    res.render('add-rating', { customers, restaurants });
});

router.get("/edit", async function (req, res, next) {
    if (!req.query.id) {
        next({ message: "Please provide a rating id" });
        return
    }
    const ratingId = req.query.id;
    const rating = await myDB.getRating(ratingId);
    const customers = await myDBCustomer.getCustomers();
    const restaurants = await myDBRestaurant.getRestaurants();
    console.log('sent to edit', rating);
    res.render('edit-rating', { rating: rating[0], customers, restaurants });
});

router.post("/edit", async function (req, res, next) {

    if (!req.body.id) {
        next({ message: "Please provide a rating id" });
        return
    }

    if (!req.body.customer) {
        next({ message: "Please provide a customer" });
        return
    }

    if (!req.body.restaurant) {
        next({ message: "Please provide a restaurant" });
        return
    }
    let overall = 0;

    try {
        overall = (parseInt(req.body.cost) + parseInt(req.body.food)
            + parseInt(req.body.service) + parseInt(req.body.parking) + parseInt(req.body.waiting)) / 5
    } catch (error) {
        next({ message: "Failed to calculate overall score" });
        return
    }

    const rating = {
        ratingId: parseInt(req.body.id),
        restID: parseInt(req.body.restaurant),
        customerID: parseInt(req.body.customer),
        cost: parseInt(req.body.cost),
        Food: parseInt(req.body.food),
        Service: parseInt(req.body.service),
        parking: parseInt(req.body.parking),
        waiting: parseInt(req.body.waiting),
        overall: overall,
        review: req.body.review,
        reviewId: req.body.reviewId = 'new' ? null : req.body.reviewId
    };

    console.log('edit rating', rating);

    try {
        const insertRating = await myDB.updateRating(rating);
        console.log("Inserted", insertRating);
        res.redirect('/rating');
    } catch (err) {
        console.log("Error Updating", err);
        next(err);
    }
});

router.post("/add", async function (req, res, next) {
    console.log('test', req.body);

    if (!req.body.customer) {
        next({ message: "Please provide a customer" });
        return
    }

    if (!req.body.restaurant) {
        next({ message: "Please provide a restaurant" });
        return
    }
    let overall = 0;

    try {
        overall = (parseInt(req.body.cost) + parseInt(req.body.food)
            + parseInt(req.body.service) + parseInt(req.body.parking) + parseInt(req.body.waiting)) / 5
    } catch (error) {
        next({ message: "Failed to calculate overall score" });
        return
    }

    const rating = {
        restID: parseInt(req.body.restaurant),
        customerID: parseInt(req.body.customer),
        cost: parseInt(req.body.cost),
        Food: parseInt(req.body.food),
        Service: parseInt(req.body.service),
        parking: parseInt(req.body.parking),
        waiting: parseInt(req.body.waiting),
        overall: overall,
        review: req.body.review
    };

    console.log('rating', rating);

    try {
        const insertRating = await myDB.insertRating(rating);
        console.log("Inserted", insertRating);
        res.redirect('/rating');
    } catch (err) {
        console.log("Error inserting", err);
        next(err);
    }
});

module.exports = router;
