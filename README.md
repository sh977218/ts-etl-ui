# TS-ETL-UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.0-rc.2.

# Getting started:
## Install NodeJS >= 18
## do `npm i`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Pantry

Pantry can be used as perishable storage. 

Create these baskets: `users1, loadRequests1, loadRequestActivities1`

The baskets will be populated when data is saved to them. 

for CI, .ci.env is used to playwright test
for local development, .development.env is used to test

## Running mocking api server

To use Pantry for perishable storage

$> export PANTRY_ID=<YOUR_PANTRY_ID>

Run `npm run start` to start NodeJS mocking api server

## Running test
Add `@debug` to desired test
Run `npm run test:debug` to start debug respect test

## Auto deploy latest master branch to render.com
https://ts-etl-ui-xrvh.onrender.com/
