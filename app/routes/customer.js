let express = require("express");
let router = express.Router();

const customerDatabase = require("../db/MySqliteDBCustomer");

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

// GET add rating page
router.get("/add", async function (req, res) {
  const cuisines = await customerDatabase.getCuisines();
  const paymentMethods = await customerDatabase.getPaymentMethods();
  const dressCodes = await customerDatabase.getDressCodes();
  res.render("add-customer", { cuisines, paymentMethods, dressCodes });
});

// GET edit rating page
router.get("/edit", async function (req, res, next) {

  if (!req.query.id) {
    next({ message: "Please provide a customer id" });
    return;
  }

  const customer = await customerDatabase.getCustomer(req.query.id);
  const cuisines = await customerDatabase.getCuisines();
  const paymentMethods = await customerDatabase.getPaymentMethods();
  const dressCodes = await customerDatabase.getDressCodes();

  res.render("edit-customer", { customer: customer[0], cuisines, paymentMethods, dressCodes });
});

// POST edit rating page
router.post("/edit", async function (req, res, next) {

  // Create array's to store the added and removed Payment methods
  const removedPayments = [];
  const addedPayments = [];

  // Set variables for payment methods
  const originalPaymentsMethods = req.body.originalPaymentMethods.split(",");
  const PaymentsMethods = req.body.paymentMethod;

  // Get removed payments
  // compare the original list with the new one and get the removed items
  for (let i = 0; i < originalPaymentsMethods.length; i++) {
    if (!PaymentsMethods.includes(originalPaymentsMethods[i]) && !removedPayments.includes(originalPaymentsMethods[i])) {
      removedPayments.push(originalPaymentsMethods[i]);
    }
  }

  // Get added payments
  for (let i = 0; i < PaymentsMethods.length; i++) {
    if (!originalPaymentsMethods.includes(PaymentsMethods[i]) && !addedPayments.includes(PaymentsMethods[i])) {
      addedPayments.push(PaymentsMethods[i]);
    }
  }

  // Create array's to store the added and removed cuisines
  const removedCuisine = [];
  const addedCuisine = [];

  // Set variables
  const originalCuisines = req.body.originalCuisines.split(",");
  const cuisine = req.body.cuisine;

  // Get removed payments
  for (let i = 0; i < originalCuisines.length; i++) {
    if (!cuisine.includes(originalCuisines[i]) && !removedCuisine.includes(originalCuisines[i])) {
      removedCuisine.push(originalCuisines[i]);
    }
  }

  // Get added payments
  for (let i = 0; i < cuisine.length; i++) {
    if (!originalCuisines.includes(cuisine[i]) && !addedCuisine.includes(cuisine[i])) {
      addedCuisine.push(cuisine[i]);
    }
  }

  // Create customer object
  const customer = {
    customerId: parseInt(req.body.customerID),
    name: req.body.name,
    smoker: req.body.smoker === "smoker" ? 1 : 0,
    drinkLevel: req.body.drinkLevel,
    dressCodeID: parseInt(req.body.dressCode),
    ambience: req.body.ambience,
    budget: req.body.budget,
    removedPayments,
    addedPayments,
    addedCuisine,
    removedCuisine
  };

  try {
    await customerDatabase.editCustomer(customer);
    res.redirect("/customer");
  } catch (err) {
    next(err);
  }
});

// POST add rating page
router.post("/add", async function (req, res, next) {

  // create customer object
  const customer = {
    name: req.body.name,
    smoker: req.body.smoker === "smoker" ? 1 : 0,
    drinkLevel: req.body.drinkLevel,
    dressCodeID: parseInt(req.body.dressCode),
    ambience: req.body.ambience,
    budget: req.body.budget,
    paymentMethods: req.body.paymentMethod,
    cuisines: req.body.cuisine
  };

  try {
    await customerDatabase.insertCustomer(customer);
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
  res.redirect("/customer");
});

module.exports = router;
