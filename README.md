# CS5200-Project-I RestaurantReview Management
Project I / Design &amp; Implement a Document Database

## Overview of Project
In this practicum you will modify the database you built for Project 1 to adjust it to a document based database (Mongo). You can reuse the project description, adjusting the logical model and choosing the main collections to use. Finally you will modify the implementation from Project 1 to make it work with MongoDB and Node.

## Format
This work should be completed individually
## Tasks
(5 pts) Provide the problem requirements and the conceptual model in UML for your project. You can reuse the ones made in Project 1

(15 pts) Adapt the Logical Data model from your Project 2 to have hierarchical tables. This is, main (root) tables from which all the other tables relate to. This main tables will become later your Mongo Collections. From your main tables you can have aggregation/composition, one to many and many to many relationships.

(10 pts) From this logical model define the main Collections (Documents/Tables) you will be using in your Mongo Database. Provide a couple of JSON examples of these objects with comments when necessary. Think about a document that you will give to another database engineer that would take over your database. From the same presentation:

(15 pts) Populate the tables with test data. You can use tools such as https://www.mockaroo.com/schemas (Links to an external site.) or  https://www.generatedata.com/ (Links to an external site.). You can export the sample data to JSON and then use mongoimport or Mongo Compass to populate your tables. Include in your repository a dump file that can be use to regenerate your database, and the instructions on how to initialize it

(30 pts) Define and execute at least five queries that show your database. At least one query must contain and aggregation https://docs.mongodb.com/manual/aggregation/ (Links to an external site.) , one must contain a complex search criterion (more than one expression with logical connectors), one should be counting documents for an specific user, and one must be updating a document based on a query parameter (e.g. flipping on or off a boolean attribute for a document, such as enabling/disabling a song)

(25 pts) Create a basic Node + Express application that let's you create, display, modify and delete at least two of the tables. One of the tables can be the users table. No need to have a polished interface, and you can use the code created in class as a starting point, and/or the code you created for Project 1

# Project proposal

@Emile Ferrand and @Misha Mody will be creating a Restaurant - Review Management System where Customers can search and query restaurants aligning to their preference and Restaurants can manage the Ratings/ Feedback and types of Customers they receive.

## @Misha Mody split would be:

- CRUD operations on the Restaurant Table
- CRUD operations on the Services and Facilities provided by the restaurant
- Query/filter restaurants based on name, food type, working hours, accepted payment methods, Facilities 

## @Emile Ferrand will be working on:

- CRUD operations on the customer table
- CRUD operation on the ratings provided by customer to the restaurant
- Query/filter reviews based on cost, service, parking, waiting time, and overall rating

# Installation

1) Clone the repository 
2) Move to the folder named "app"
3) `npm install`
4) `npm start`
5) goto `http://localhost:2000/` to view the project

# Documents:

- [project document .docx](./docs/CS5200%20project%201.docx)
- [project document .pdf](./docs/CS5200%20project%201.pdf)

# Conceptual Model:

![Conceptual Model](./diagrams/UML.png)

# logical Model:

![Logical Model](./diagrams/ERD.png)

# SQL sample data statements:

- [Rating](./db/rating-example.json)
- [Restaurant](./db/restaurant-sample.json) 

# Populate the tables with test data:

- [Rating database dump](./db/rating.json)
- [Restaurant database dump](./db/restaurant.json)

#Define and execute at least five queries that show your database:
- [Rating Query](.db/query/rating.js)
- [Restaurant Query](.db/query/restaurant.js)
# Made by
https://github.com/Misha-Mody

https://github.com/emile-f
