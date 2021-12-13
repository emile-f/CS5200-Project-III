# CS5200-Project-I RestaurantReview Management
Project I / Design &amp; Implement a Document Database

## Overview of Project
In this practicum you will modify the database you built for previous projects to adjust them to a key-value in-memory database (Redis). You can reuse the project description, selecting one data structure that makes sense to be implemented as an in-memory store. Finally you will modify your existing codebase to make it work with Node and Redis.

## Format
This work should be completed individually
## Tasks
(15 pts) Provide the problem requirements and the conceptual model in UML for your project. You can reuse the one made on previous projects, but describe the functionalities that you selected to be used as an in-memory key-value storage, (e.g. most viewed products, a shopping cart, current logged-in users, etc).

(25 pts) Describe the Redis data structures that you are going to use to implement the functionalities you described in the previous point. (e.g. To implement the most viewed products I will use a Redis sorted set with key "mostViewed:userId", product ids as the values and a score of the number of views of the product.). You can use/describe more than one data structure, you will need to implement at least one.

(60 pts) Create a basic Node + Express application that let's you create, display, modify and delete at least one Redis data structure from the ones describe in the previous point. No need to have a polished interface, and you can use the code created in class as a starting point, and/or the code you created for previous projects

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


# Conceptual Model:

![Conceptual Model](./diagrams/UML.png)

# logical Model:

![Logical Model](./diagrams/ERD.png)

# Data-Structure Used:
![Data Structure](./datastructures/ds.docx)

# Made by
https://github.com/Misha-Mody

https://github.com/emile-f
