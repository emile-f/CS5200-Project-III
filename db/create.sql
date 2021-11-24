-- Cuisine: 
CREATE TABLE "Cuisine" ( 
	"cuisineID" INTEGER NOT NULL UNIQUE, 
	"cuisine" TEXT NOT NULL, 
	PRIMARY KEY("cuisineID" AUTOINCREMENT) 
)

-- CuisineCustomer:
CREATE TABLE "CuisineCustomer" ( 
	"cuisineCustomerID" INTEGER NOT NULL UNIQUE, 
	"customerId" INTEGER, 
	"cuisineId" INTEGER NOT NULL, 
	PRIMARY KEY("cuisineCustomerID" AUTOINCREMENT), 
	FOREIGN KEY
("customerId") REFERENCES "Customer"
("customerID"), 
	FOREIGN KEY
("cuisineId") REFERENCES "Cuisine"
("cuisineID") 
)

-- CuisineRestaurant:
CREATE TABLE "CuisineRestaurant" ( 
	"cuisineRestaurantID" INTEGER NOT NULL UNIQUE, 
	"restID" INTEGER NOT NULL, 
	"cuisineId" INTEGER NOT NULL, 
	PRIMARY KEY("cuisineRestaurantID" AUTOINCREMENT), 
	FOREIGN KEY
("restID") REFERENCES "Restaurant"
("restID"), 
	FOREIGN KEY
("cuisineId") REFERENCES "Cuisine"
("cuisineID") 
)

-- Restaurant:
CREATE TABLE "Customer" ( 
	"customerID" INTEGER NOT NULL UNIQUE, 
	"name" TEXT NOT NULL, 
	"smoker" INTEGER NOT NULL, 
	"drinkLevel" TEXT NOT NULL, 
	"dressCodeID" INTEGER NOT NULL, 
	"ambience" TEXT NOT NULL, 
	"budget" TEXT NOT NULL, 
	PRIMARY KEY("customerID" AUTOINCREMENT), 
	FOREIGN KEY
("dressCodeID") REFERENCES "DressCode"
("dressCodeID") 
)

-- Days:
CREATE TABLE "Days" ( 
	"daysID" INTEGER NOT NULL UNIQUE, 
	"days" TEXT NOT NULL, 
	PRIMARY KEY("daysID" AUTOINCREMENT) 
)

-- DressCode:
CREATE TABLE "DressCode" ( 
	"dressCodeID" INTEGER NOT NULL UNIQUE, 
	"dressCode" TEXT NOT NULL, 
	PRIMARY KEY("dressCodeID" AUTOINCREMENT) 
)

-- Facilities:
CREATE TABLE "Facilities" ( 
	"facilitiesID" INTEGER NOT NULL UNIQUE, 
	"restID" INTEGER NOT NULL, 
	"parkingSpace" INTEGER NOT NULL, 
	"ambience" TEXT NOT NULL, 
	"seatingArea" TEXT NOT NULL, 
	PRIMARY KEY("facilitiesID" AUTOINCREMENT), 
	FOREIGN KEY
("restID") REFERENCES "Restaurant"
("restID") 
)

-- PaymentsMethods:
CREATE TABLE "PaymentMethods" ( 
	"paymentMethodsID" INTEGER NOT NULL UNIQUE, 
	"method" BLOB NOT NULL, 
	PRIMARY KEY("paymentMethodsID" AUTOINCREMENT) 
)

-- PaymentMethodsCustomer:
CREATE TABLE "PaymentMethodsCustomer" ( 
	"paymentMethodsCustomerID" INTEGER NOT NULL UNIQUE, 
	"customerId" INTEGER NOT NULL, 
	"paymentMethodsID" INTEGER NOT NULL, 
	PRIMARY KEY("paymentMethodsCustomerID" AUTOINCREMENT), 
	FOREIGN KEY
("paymentMethodsID") REFERENCES "PaymentMethods"
("paymentMethodsID"), 
	FOREIGN KEY
("customerId") REFERENCES "Customer"
("customerID") 
);

-- PaymentMethodsRestaurant:
CREATE TABLE "PaymentMethodsRestaurant" ( 
	"paymentMethodsRestaurantID" INTEGER NOT NULL UNIQUE, 
	"restID" INTEGER NOT NULL, 
	"paymentMethodsID" INTEGER NOT NULL, 
	PRIMARY KEY("paymentMethodsRestaurantID" AUTOINCREMENT), 
	FOREIGN KEY
("restID") REFERENCES "Restaurant"
("restID"), 
	FOREIGN KEY
("paymentMethodsID") REFERENCES "PaymentMethods"
("paymentMethodsID") 
);

-- Rating:
CREATE TABLE "Rating" ( 
	"ratingId" INTEGER NOT NULL UNIQUE, 
	"restID" INTEGER NOT NULL, 
	"customerID" INTEGER NOT NULL, 
	"cost" INTEGER NOT NULL, 
	"Food" INTEGER NOT NULL, 
	"Service" INTEGER NOT NULL, 
	"parking" INTEGER NOT NULL, 
	"waiting" INTEGER NOT NULL, 
	"overall" REAL NOT NULL, 
	PRIMARY KEY("ratingId" AUTOINCREMENT), 
	FOREIGN KEY
("restID") REFERENCES "Restaurant"
("restID"), 
	FOREIGN KEY
("customerID") REFERENCES "Customer"
("customerID") 
);

-- Restaurant:
CREATE TABLE "Restaurant" ( 
	"restID" INTEGER NOT NULL UNIQUE, 
	"dressCodeID" INTEGER NOT NULL, 
	"name" TEXT NOT NULL, 
	"address" TEXT NOT NULL, 
	"zip" INTEGER NOT NULL, 
	"city" TEXT NOT NULL, 
	"state" TEXT NOT NULL, 
	"country" TEXT NOT NULL, 
	"priceRangeMin" INTEGER NOT NULL, 
	"priceRangeMax" INTEGER NOT NULL, 
	"openHours" TEXT NOT NULL, 
	"closeHours" TEXT NOT NULL, 
	PRIMARY KEY("restID" AUTOINCREMENT), 
	FOREIGN KEY
("dressCodeID") REFERENCES "DressCode"
("dressCodeID") 
);

-- Review:

CREATE TABLE "Review" ( 
	"reviewID" INTEGER NOT NULL UNIQUE, 
	"review" TEXT NOT NULL, 
	"ratingID" INTEGER NOT NULL, 
	PRIMARY KEY("reviewID" AUTOINCREMENT), 
	FOREIGN KEY
("ratingID") REFERENCES "Rating"
("ratingId") 
);

-- Services:
CREATE TABLE "Services" ( 
	"servicesID" INTEGER NOT NULL UNIQUE, 
	"restID" INTEGER NOT NULL, 
	"alcohol" INTEGER NOT NULL, 
	"smoking" INTEGER NOT NULL, 
	PRIMARY KEY("servicesID" AUTOINCREMENT), 
	FOREIGN KEY
("restID") REFERENCES "Restaurant"
("restID")
);

-- WorkingDays:
CREATE TABLE "WorkingDays" ( 
	"workingDaysID" INTEGER NOT NULL UNIQUE, 
	"restID" INTEGER NOT NULL, 
	"daysID" INTEGER NOT NULL, 
	PRIMARY KEY("workingDaysID" AUTOINCREMENT), 
	FOREIGN KEY
("daysID") REFERENCES "Days"
("daysID"), 
	FOREIGN KEY
("restID") REFERENCES "Restaurant"
("restID") 
); 