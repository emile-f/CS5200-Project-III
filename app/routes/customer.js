let express = require("express");
let router = express.Router();

const customerDatabase = require("../db/MyMongoDBCustomer");
const customerCache = require("../db/MyRedisDBCustomer");

/* GET home page. */
router.get("/", async function (req, res, next) {

  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;

  try {
    let total = await customerDatabase.getCustomersCount();
    const customers = await customerDatabase.getCustomers(page, pageSize);
    res.render("customers", { customers, currentPage: page, lastPage: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }

});

// GET edit rating page
router.get("/edit", async function (req, res, next) {

  if (!req.query.id) {
    next({ message: "Please provide a customer id" });
    return;
  }

  let customer;
  const cachedCustomer = await customerCache.checkAndGetCustomer(req.query.id);
  if (cachedCustomer) {
    customer = cachedCustomer;
    console.log("returning customer from cache");
  } else {
    customer = await customerDatabase.getCustomer(req.query.id);
    await customerCache.setCustomer(req.query.id, customer);
    console.log("returning customer from mongo and caching result");
  }

  const cuisines = await customerDatabase.getCuisines();
  const paymentMethods = await customerDatabase.getPaymentMethods();
  const dressCodes = await customerDatabase.getDressCodes();
  res.render("edit-customer", { customer: customer, cuisines, paymentMethods, dressCodes });
});

// POST edit rating page
router.post("/edit", async function (req, res, next) {
  // Create customer object
  const customer = {
    customerId: parseInt(req.body.customerID),
    name: req.body.name,
    smoker: req.body.smoker === "smoker" ? true : false,
    drinkLevel: req.body.drinkLevel,
    dressCode: req.body.dressCode,
    ambience: req.body.ambience,
    budget: req.body.budget,
    paymentMethods: req.body.paymentMethod,
    cuisine: req.body.cuisine
  };

  try {
    await customerDatabase.editCustomer(customer);

    // edit redis cache
    await customerCache.setCustomer(customer.customerId, customer);

    res.redirect("/customer");
  } catch (err) {
    next(err);
  }
});

// GET delete rating
router.get("/delete", async function (req, res, next) {
  if (!req.query.id) {
    next({ message: "Please provide a customer id" });
    return;
  }
  const customerId = req.query.id;
  await customerDatabase.deleteCustomer(customerId);

  // delete redis cache
  await customerCache.deleteCustomer(customerId);

  res.redirect("/customer");
});

module.exports = router;
