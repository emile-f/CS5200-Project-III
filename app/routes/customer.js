let express = require("express");
let router = express.Router();

const myDB = require("../db/MySqliteDBCustomer");

/* GET home page. */
router.get("/", async function (req, res, next) {

  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;

  try {
    let total = await myDB.getCustomersCount();
    const customers = await myDB.getCustomers(page, pageSize);
    res.render("customers", { customers, currentPage: page, lastPage: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }

});

router.get("/add", async function (req, res) {
  const cuisines = await myDB.getCuisines();
  const paymentMethods = await myDB.getPaymentMethods();
  const dressCodes = await myDB.getDressCodes();
  res.render("add-customer", { cuisines, paymentMethods, dressCodes });
});

router.get("/edit", async function (req, res, next) {
  if (!req.query.id) {
    next({ message: "Please provide a customer id" });
    return;
  }
  const customerId = req.query.id;
  const customer = await myDB.getCustomer(customerId);
  console.log("customer", customer);
  const cuisines = await myDB.getCuisines();
  const paymentMethods = await myDB.getPaymentMethods();
  const dressCodes = await myDB.getDressCodes();
  res.render("edit-customer", { customer: customer[0], cuisines, paymentMethods, dressCodes });
});

router.post("/edit", async function (req, res, next) {
  console.log("test edit", req.body);

  const removedPayments = [];
  const addedPayments = [];

  // Set variables
  const originalPaymentsMethods = req.body.originalPaymentMethods.split(",");
  const PaymentsMethods = req.body.paymentMethod;

  // Get removed payments
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



  console.log("customer", customer);

  try {
    const insertCustomer = await myDB.editCustomer(customer);
    console.log("Inserted", insertCustomer);
    res.redirect("/customer");
  } catch (err) {
    console.log("Error inserting", err);
    next(err);
  }
});

router.post("/add", async function (req, res, next) {
  console.log("test", req.body);

  if (!req.body.name) {
    next({ message: "Please provide a name for the customer" });
    return;
  }

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

  console.log("customer", customer);

  try {
    const insertCustomer = await myDB.insertCustomer(customer);
    console.log("Inserted", insertCustomer);
    res.redirect("/customer");
  } catch (err) {
    console.log("Error inserting", err);
    next(err);
  }
});

router.get("/delete", async function (req, res, next) {
  if (!req.query.id) {
    next({ message: "Please provide a customer id" });
    return;
  }
  const customerId = req.query.id;
  await myDB.deleteCustomer(customerId);
  res.redirect("/customer");
});

module.exports = router;
