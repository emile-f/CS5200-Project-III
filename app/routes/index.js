let express = require("express");
let router = express.Router();

const myDB = require("../db/mySqliteDB.js");

/* GET home page. */
/* GET home page. */
router.get("/", async function (req, res, next) {
  res.redirect("/restaurants");
});

router.get("/restaurants", async function (req, res, next) {
  const query = req.query.q || "";
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;
  try {
    let total = await myDB.getRestaurantCount(query);
    let restaurant = await myDB.getRestaurants(query, page, pageSize);
    res.render("index2", {
      restaurants: restaurant,
      query,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

//router.post("/restaurants/delete", async function (req, res, next) {
//   const id = req.body;
//   console.log(id);
//   await myDB.deleteRestaurant(id);
//   res.redirect("/restaurants");
// });

router.get("/restaurants/add", async function (req, res, next) {
  res.render("addRestaurant", {});
});

router.get("/restaurants/cuisine", async function (req, res, next) {
  res.render("cuisine.ejs", {});
});

router.get("/restaurants/:restID", async function (req, res, next) {
  const restID = req.params.restID;
  const restaurant = await myDB.viewRestaurantsyID(restID);
  const facilities = await myDB.viewFacilities(restID);
  const services = await myDB.viewServices(restID);
  const payment = await myDB.viewPaymentMethod(restID);
  const working = await myDB.viewWorkingDays(restID);
  const cuisine = await myDB.getCuisineByID(restID);
  const days = [];
  working.forEach((r) => {
    days.push(r.days);
  });

  const pays = [];
  payment.forEach((r) => {
    pays.push(r.method);
  });
  res.render("restaurantByID", {
    r: restaurant,
    f: facilities,
    s: services,
    p: pays,
    w: days,
    c: cuisine,
  });
});

router.get("/restaurants/view/:restID", async function (req, res, next) {
  const restID = req.params.restID;
  const restaurant = await myDB.viewRestaurantsyID(restID);
  const facilities = await myDB.viewFacilities(restID);
  const services = await myDB.viewServices(restID);
  const payment = await myDB.viewPaymentMethod(restID);
  const working = await myDB.viewWorkingDays(restID);
  const cuisine = await myDB.getCuisineByID(restID);
  const days = [];
  working.forEach((r) => {
    days.push(r.days);
  });
  console.log(cuisine);
  const pays = [];
  payment.forEach((r) => {
    pays.push(r.method);
  });
  res.render("viewDetails", {
    r: restaurant,
    f: facilities,
    s: services,
    p: pays,
    w: days,
    c: cuisine,
  });
});

router.post("/restaurants/create", async function (req, res, next) {
  const rest = req.body;
  await myDB.createRestaurant(rest);
  res.redirect("/restaurants");
});

router.post("/restaurants/update/:restID", async function (req, res, next) {
  const rest = req.body;
  console.log(rest);
  await myDB.updateRestaurant(rest);
  //res.redirect("/restaurants");

  res.render("restaurantByID", { r: rest });
});

module.exports = router;
