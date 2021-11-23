let express = require("express");
let router = express.Router();

// Routes
const customerRoute = require("./customer");
const ratingRoute = require("./rating");
const myDB = require("../db/MyMongoDB");


/* GET home page. */
router.get("/", async function (req, res) {
  res.render("index");
});

router.use("/customer", customerRoute);
router.use("/rating", ratingRoute);

router.get("/restaurants", async function (req, res, next) {
  const zip = req.query.z || null;
  const query = req.query.q || "";
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;
  const filter = req.query.filter;
  console.log(filter);
  try {
    let total = await myDB.getRestaurantCount(query,zip);
    let restaurant = await myDB.getRestaurants(zip, query, page, pageSize);
    res.render("index2", {
      restaurants: restaurant,
      query,
      zip,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/restaurants/delete/:restID/:cuisine",
  async function (req, res) {
    const restID = req.params.restID;
    const cuisine = req.params.cuisine;
    await myDB.deleteRestFromCuisine(restID);
    res.redirect("/restaurants/cuisine/" + cuisine);
  }
);

router.get("/restaurants/add", async function (req, res) {
  res.render("addRestaurant", {});
});

router.get("/restaurants/cuisine", async function (req, res) {
  const cuisine = await myDB.getDistinctCuisine();
  console.log(cuisine);
  res.render("cuisine.ejs", { c: cuisine });
});

router.get("/restaurants/cuisine/:cuisine", async function (req, res) {
  const cuisine = req.params.cuisine;
  const rest = await myDB.getRestByCuisine(cuisine);
  console.log(rest);
  res.render("restList.ejs", {
    rs: rest,
    c: cuisine,
  });
});

router.get("/restaurants/:restID", async function (req, res) {
  const restID = req.params.restID;
  const restaurantArr = await myDB.viewRestaurantsByID(restID);
  const restaurant = restaurantArr[0];

  res.render("restaurantByID", {
    r: restaurant,
    f: restaurant.facilities,
    s: restaurant.services,
    p: restaurant.payments,
    w: restaurant.workingDays,
    c: restaurant.cuisine,
  });
});

router.get("/restaurants/view/:restID", async function (req, res) {
  const restID = req.params.restID;
  const restaurantArr = await myDB.viewRestaurantsByID(restID);
  const restaurant = restaurantArr[0];
  // const facilities = await myDB.viewFacilities(restID);
  // const services = await myDB.viewServices(restID);
  // const payment = await myDB.viewPaymentMethod(restID);
  // const working = await myDB.viewWorkingDays(restID);
  // const cuisine = await myDB.getCuisineByID(restID);
  // const days = [];
  // working.forEach((r) => {
  //   days.push(r.days);
  // });
  // console.log(cuisine);
  // const pays = [];
  // payment.forEach((r) => {
  //   pays.push(r.method);
  // });
  res.render("viewDetails", {
    r: restaurant,
    f: restaurant.facilities,
    s: restaurant.services,
    p: restaurant.payments,
    w: restaurant.workingDays,
    c: restaurant.cuisine,
  });
});

router.post("/restaurants/create", async function (req, res) {
  const rest = req.body;
  await myDB.createRestaurant(rest);
  res.redirect("/restaurants");
});

router.post("/restaurants/update/:restID", async function (req,res) {
  const rest = req.body;
  //console.log(rest);
  await myDB.updateRestaurant(rest);
  //res.redirect("/restaurants");
  const restaurantArr = await myDB.viewRestaurantsByID(rest.restID);
  const restaurant = restaurantArr[0];

  res.render("restaurantByID", {
    r: restaurant,
    f: restaurant.facilities,
    s: restaurant.services,
    p: restaurant.payments,
    w: restaurant.workingDays,
    c: restaurant.cuisine,
  });
});

module.exports = router;
