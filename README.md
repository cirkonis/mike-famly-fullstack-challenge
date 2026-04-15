# Famly technical challenge: Fullstack Engineer

Hi :wave:

This repository contains a technical challenge for a full-stack engineering
role at Famly.

## Expectations

We don't expect you to spend a lot of time on this - no more than 2-3 hours.
If you get stuck on a question or don't manage to finish it within that time limit,
please don't sweat it.

The main purpose of this technical assignment is for us to get a feeling for:

- Your technical abilities
- Your problem solving skills
- Your product sense

In the follow up interview we'll ask you to walk us through your solution,
asking questions along the way. If there are pieces missing, we'll use the
time to discuss potential solutions or potentially do some light
pair programming together. The main purpose here is for us to get a sense
for whether we're a good collaboration match - both for us and for you. We're
also interested in understanding your ability to communicate your ideas while
you're walking us through your solution and learn about potential improvements you'd make
if you'd have more time.

## Instructions

1. Start by forking this repository
2. Decide whether you want to solve the backend parts of this challenge in Scala
   or in NodeJS
3. Solve the [exercises](#exercises) below. Code what you can, and write your thoughts for the exercises you couldn't solve in the [answers.md](answers.md) file. 
4. For each question you answer, please create a commit and push them
   to the main branch. **Remember to include a helpful commit message**.
5. When you're done, send us an email with the link to the forked repository. If you prefer not to fork it, you can also zip your solution and send it via email. 

Feel free to reach out with any questions before starting the challenge via email. 

## About this project

This project is a simple web application meant to represent a tiny use case of Famly: The Bill Payer profile. In Famly, a parent that pays for the kids tuition is called a Bill Payer.
In this project, the Bill Payer profile includes some helpful features such as:

- Invoices: List all invoices that the nursery has sent to this parent.
- Payment methods: A bill payer can have 0 or more payment methods. An active payment method is what the nursery uses to charge the
  parent.

The data in this web app is meant to be very simple - in real life it's a _little bit more complex than that_.

## How to run this project

This project consists of:

- A Scala backend
- A NodeJS backend
- A React + TypeScript Frontend
- A MySQL database

We've included both a Scala backend and a NodeJS backend so that you can
choose which you prefer to work with.

You can of course run the application any way you want, but if you want to
avoid the hassle of getting all the tools/dependencies installed on your
system, we've prepared a [docker-compose.yml](docker-compose.yml)
file for you so you can simply run the app via:

```sh
# Using the Scala backend
docker-compose --profile scala up --build

# Using the NodeJS backend
docker-compose --profile nodejs up --build

```

> In order for this to work, we recommend installing [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Once everything is up-and-running via docker-compose you can access

**The database at:**

- Host: 127.0.0.1
- Port: 3308
- Username: root
- Password: root

**The frontend at:**

- <http://localhost:3000>

**The backend at:**

- <http://localhost:9000>

When making changes to the code the servers running in Docker will pick up those changes. Once everything is done re-building and tests run successfully, you should be able to see your changes by refreshing the page.

**Making changes to the database**

If you need to make changes to the database tables,
you can add migrations in the [migrations](migrations) directory and then run `docker-compose up flyway` to apply the migrations to the database. You can also just apply the migrations to the database directly, but if you do, please make sure to
note down the SQL statements in the [answers.md](answers.md) file.

## Exercises

### 1

When a user interacts with the Payment Methods widget, something seems off.
When adding or deleting or activating a payment method the changes are not
reflected until the user refreshes the page.

<https://github.com/user-attachments/assets/98fdc4cc-38d9-4a66-b7be-0001a45d9d37>

Please fix this issue, so that updates are reflected right away without
needing to refresh the page.

### 2

A user has reported that when they delete a payment method, sometimes
multiple payment methods are deleted (instead of just the one).

Please debug and fix the underlying issue.

### 3

The Payment Methods widget is missing a critical feature: A parent should
always have at least one active payment method. Otherwise, the nursery cannot
charge the parent for the care.

Unfortunately this is not the case right now. If you delete an active payment method,
you end up with no active payment methods.

Please implement this missing feature to ensure that the nursery can always
charge all their parents.

### 4

A parent has requested to be able to see _when_ each payment method was created
in the Payment Methods widget. This is useful in cases where you have multiple
payment methods with the same name.

Please implement this missing feature.

### 5

For audit reasons, it's important to capture any updates that are made to payment
methods for each parent. We need to capture exactly what changed, when it occurred,
and who made the change.

Please implement this critical missing functionality, so that we'll stay in business!
