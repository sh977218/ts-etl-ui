# TS-ETL-UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.0-rc.2.

# Getting started:
## Install NodeJS >= 18
## do `npm i`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Mongo

Mongo can be used as perishable storage. 
- Register a free account: https://www.mongodb.com/products/platform/atlas-database
- Create `Database` called `ts-etl-ui`
- Create Collections called `users, loadRequests, loadRequestActivities, versionQAs`
- Inject/load data from /server/data/

for CI, .ci.env is used to playwright test, with collection name appendix with ${pr_number}

for local development, .development.env is used to test

for prod, .ci.env is used. The collection names are `users, loadRequests, loadRequestActivities, versionQAs`

## Running mocking api server

To use Mongo for perishable storage

$> export MONGO_USERNAME=secret_username
$> export MONGO_PASSWORD=secret_password
$> export MONGO_HOSTNAME=secret_hostname

or

using `.development.env`, put
```angular2html
MONGO_USERNAME=secret_username
MONGO_PASSWORD=secret_password
MONGO_HOSTNAME=secret_hostname
```

Run `npm run start:development` to start NodeJS mocking api server

## Running test
Add `@debug` to desired test
Run `npm run test:debug` to start debug respect test

## Auto deploy latest master branch to render.com
https://ts-etl-ui-xrvh.onrender.com/
