const fs = require('fs');

var cuisine = ['Chinese', 'American', 'Continental', 'Cuban', 'French', 'Greek',
  'Indian', 'Indonesian', 'Italian', 'Japanese', 'Lebanese', 'Malaysian', 'Mexican',
  'Pakistani', 'Russian', 'Singapore', 'Spanish', 'Thai', 'Tibetan', 'Vietnamese'];

var payments = ['cash', 'VISA', 'bank_debit_cards', 'MasterCard-Eurocard', 'American_Express']
var dressCode = ['no preference', 'informal', 'formal', 'elegant', '?'];

function readTsv() {
  var file = fs.readFileSync('../data/Restaurant_Reviews.tsv').toString();
  var data = file.split(/\r\n|\n/);
  for (let index = 0; index < data.length; index++) {
    data[index] = data[index].split('\t')[0];
  }
  return data;
}

function readJson(path) {
  var file = fs.readFileSync(path).toString();
  var data = JSON.parse(file);
  return data;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// number of ratings in db: 1161
var jsonFileRatings = readJson('../data/Rating.json');
var jsonFileCustomer = readJson('../data/Customer.json');

for (let index = 0; index < jsonFileRatings.length; index++) {
  // replace customerID with customer object
  if (jsonFileRatings[index].customerID) {
    var customer_id = getRandomInt(0, 413); // get random customer
    var customer = jsonFileCustomer[customer_id];

    customer['dressCode'] = dressCode[(customer['dressCodeID'] - 1)]
    customer['smoker'] = customer['smoker'] == 1 ? true : false

    // Add cuisine 
    var amountCuisine = getRandomInt(1, 20);
    var alreadyDoneCuisine = [];

    for (let s = 0; s < amountCuisine; s++) {
      var n = getRandomInt(1, 20);
      while (alreadyDoneCuisine.includes(n)) {
        n = getRandomInt(1, 20);
      }
      alreadyDoneCuisine.push(n);
    }

    customer['cuisine'] = [];
    for (let j = 0; j < alreadyDoneCuisine.length; j++) {
      customer['cuisine'].push(cuisine[alreadyDoneCuisine[j]]);
    }

    // Add Payments 
    var amountPayments = getRandomInt(1, 5);
    var alreadyDonePayments = [];

    for (let s = 0; s < amountPayments; s++) {
      var n = getRandomInt(1, 5);
      while (alreadyDonePayments.includes(n)) {
        n = getRandomInt(1, 5);
      }
      alreadyDonePayments.push(n);
    }

    customer['paymentMethods'] = [];
    for (let w = 0; w < alreadyDonePayments.length; w++) {
      customer['paymentMethods'].push(payments[alreadyDonePayments[w]]);
    }

    jsonFileRatings[index]['customer'] = customer;
  }
}

// Add reviews
var alreadyDone = [];
var reviews = readTsv();

// random number of reviews in db = 649
for (let step = 0; step < 649; step++) {
  var review = reviews[step]

  // get random rating
  var n = getRandomInt(1, 1162);

  // make sure we don't add a rating twice
  while (alreadyDone.includes(n)) {
    n = getRandomInt(1, 1161);
  }

  jsonFileRatings[n]['review'] = review
}

// remove not needed properties
for (let index = 0; index < jsonFileRatings.length; index++) {
  delete jsonFileRatings[index]['customerID'];
  if (jsonFileRatings[index]['customer']) {
    delete jsonFileRatings[index]['customer']['dressCodeID'];
  }
}

fs.writeFileSync('Rating-complete.json', JSON.stringify(jsonFileRatings));