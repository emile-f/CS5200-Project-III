var fs = require('fs');

var data = [['reviewID', 'review', 'ratingID']]

// source: https://www.kaggle.com/apekshakom/sentiment-analysis-of-restaurant-reviews/data
function readTsv() {
    var file = fs.readFileSync('../data/Restaurant_Reviews.tsv').toString();
    var data = file.split(/\r\n|\n/);
    for (let index = 0; index < data.length; index++) {
        data[index] = data[index].split('\t')[0];
    }
    return data;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// number of ratings in db: 1161



// step is user id
var i = 1; // PK
var alreadyDone = [];
var reviews = readTsv();

// random number of reviews in db = 649
for (let step = 0; step < 649; step++) {
    var inner = [i, reviews[step]];

    // get random rating
    var n = getRandomInt(1, 1161);
    // make sure we don't add a rating twice
    while (alreadyDone.includes(n)) {
        n = getRandomInt(1, 1161);
    }
    alreadyDone.push(n);
    inner.push(n);
    data.push(inner);
    i++;
}

let csvContent = ''
    + data.map(e => e.join(";")).join("\n");

fs.writeFileSync('data-Review.csv', csvContent);


