let express = require("express");
let router = express.Router();

const ratingDatabase = require("../db/MySqliteDBRating");
const customerDatabase = require("../db/MySqliteDBCustomer");
const restaurantDatabase = require("../db/MySqliteDBRestaurant");

/* GET home page. */
router.get("/", async function (req, res, next) {

  const filter = {
    cost: req.query.cost || 0,
    food: req.query.food || 0,
    service: req.query.service || 0,
    parking: req.query.parking || 0,
    waiting: req.query.waiting || 0,
    overall: req.query.overall || 0
  };

  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;

  try {
    let total = await ratingDatabase.getRatingsCount(filter);
    const ratings = await ratingDatabase.getRatings(filter, page, pageSize);
    res.render("ratings", { filter, ratings, currentPage: page, lastPage: Math.ceil(total / pageSize), });
  } catch (err) {
    next(err);
  }

});

/* GET add rating page. */
router.get("/add", async function (req, res) {
  const customers = await customerDatabase.getCustomersAll();
  const restaurants = await restaurantDatabase.getRestaurants();
  res.render("add-rating", { customers, restaurants });
});

/* GET edit rating page. */
router.get("/edit", async function (req, res, next) {
  if (!req.query.id) {
    next({ message: "Please provide a rating id" });
    return;
  }
  const rating = await ratingDatabase.getRating(req.query.id);
  const customers = await customerDatabase.getCustomersAll();
  const restaurants = await restaurantDatabase.getRestaurants();
  res.render("edit-rating", { rating: rating[0], customers, restaurants });
});

/* POST edit rating page. */
router.post("/edit", async function (req, res, next) {

  if (!req.body.id) {
    next({ message: "Please provide a rating id" });
    return;
  }

  if (!req.body.customer) {
    next({ message: "Please provide a customer" });
    return;
  }

  if (!req.body.restaurant) {
    next({ message: "Please provide a restaurant" });
    return;
  }
  let overall = 0;

  try {
    overall = (parseInt(req.body.cost) + parseInt(req.body.food)
      + parseInt(req.body.service) + parseInt(req.body.parking) + parseInt(req.body.waiting)) / 5;
  } catch (error) {
    next({ message: "Failed to calculate overall score" });
    return;
  }

  const newLocal = "new";
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
    reviewId: req.body.reviewId = newLocal ? null : req.body.reviewId
  };

  console.log("rating", rating);

  try {
    await ratingDatabase.updateRating(rating);
    res.redirect("/rating");
  } catch (err) {
    next(err);
  }
});

/* POST add rating page. */
router.post("/add", async function (req, res, next) {

  if (!req.body.customer) {
    next({ message: "Please provide a customer" });
    return;
  }

  if (!req.body.restaurant) {
    next({ message: "Please provide a restaurant" });
    return;
  }
  let overall = 0;

  try {
    overall = (parseInt(req.body.cost) + parseInt(req.body.food)
      + parseInt(req.body.service) + parseInt(req.body.parking) + parseInt(req.body.waiting)) / 5;
  } catch (error) {
    next({ message: "Failed to calculate overall score" });
    return;
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

  try {
    await ratingDatabase.insertRating(rating);
    res.redirect("/rating");
  } catch (err) {
    next(err);
  }
});

/* GET delete rating. */
router.get("/delete", async function (req, res, next) {
  if (!req.query.id) {
    next({ message: "Please provide a rating id" });
    return;
  }
  await ratingDatabase.deleteRating(req.query.id);
  res.redirect("/rating");
});

module.exports = router;
