# Running the application

## 1. Prerequisites

* docker
* docker compose
* Internet connection

## 2. Run the application

Run `docker-compose up` in the console. It will install all packages, build and run the application.
You will know that the application is up and running when you see this message:
`info: Accountable API is listening on port 3005`

## 3. Run the unit tests 

Run `docker-compose -f docker-compose.test.yml up` in the console. It will install all packages and execute the tests of the application.

## 3. Documentation and Testing the application

Go to `http://localhost:3005/api/docs`
You will see a swagger page with all available endpoints.

## 4. Known issues

## 5. Assumptions

1. The global coal market is known and predefined.
2. The inhabitants can't accept their own offers.