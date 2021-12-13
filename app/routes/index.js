let express = require("express");
let router = express.Router();

// Routes
const customerRoute = require("./customer");
const ratingRoute = require("./rating");
const myDB = require("../db/MyRedisDB");


/* GET home page. */
router.get("/", async function (req, res) {
  res.render("index");
});

router.use("/customer", customerRoute);
router.use("/rating", ratingRoute);

router.get("/restaurants", async function (req, res, next) {

  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;
  // const filter = req.query.filter;
  // console.log(filter);
  try {
    let total = await myDB.getRestaurantCount();
    
    let restaurant = await myDB.getRestaurants(page, pageSize);
    //console.log(restaurant);
    res.render("index2", {
      restaurants: restaurant,
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
  cuisine.shift();
  res.render("cuisine.ejs", { c: cuisine });
});

router.get("/restaurants/cuisine/:cuisine", async function (req, res) {
  const cuisine = req.params.cuisine;
  const rest = await myDB.getRestByCuisine(cuisine);
  res.render("restList.ejs", {
    rs: rest,
    c: cuisine,
  });
});

router.get("/restaurants/:restID", async function (req, res) {
  const restID = req.params.restID;
  const restaurant = await myDB.viewRestaurantsByID(restID);
  res.render("restaurantByID", {
    r: restaurant,
    f: restaurant.facilities_ambience,
    s: restaurant.services_alcohol,
    p: restaurant.payments?restaurant.payments:[],
    w: restaurant.workingDays? restaurant.workingDays.split(",") : [],
    c: restaurant.cuisine? restaurant.cuisine.split(","): [],
  });
});

router.get("/restaurants/view/:restID", async function (req, res) {
  const restID = req.params.restID;
  const restaurant = await myDB.viewRestaurantsByID(restID);
  res.render("viewDetails", {
    r: restaurant,
    f: restaurant.facilities_ambience,
    s: restaurant.services_alcohol,
    p: restaurant.payments?restaurant.payments:[],
    w: restaurant.workingDays? restaurant.workingDays.split(",") : [],
    c: restaurant.cuisine? restaurant.cuisine.split(","): [],
  });
});

router.post("/restaurants/create", async function (req, res) {
  const rest = req.body;
  await myDB.createRestaurant(rest);
  res.redirect("/restaurants");
});

router.post("/restaurants/update/:restID", async function (req, res) {
  const rest = req.body;
  await myDB.updateRestaurant(rest);
  //res.redirect("/restaurants");
  const restaurant = await myDB.viewRestaurantsByID(rest.restID);
  res.render("restaurantByID", {
    r: restaurant,
    f: restaurant.facilities_ambience,
    s: restaurant.services_alcohol,
    p: restaurant.payments?restaurant.payments:[],
    w: restaurant.workingDays? restaurant.workingDays.split(",") : [],
    c: restaurant.cuisine? restaurant.cuisine.split(","): [],
  });
});

module.exports = router;
