# TS-ETL-UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.0-rc.2.

# Getting started:

## Install NodeJS >= 20

## do `npm i`

## Development server

- Edit `host` file, add the following line to map development domain, so UTS allows the request.
  the request.

```
127.0.0.1       ts.mlb.nih.gov
```

- Run `ng serve` for a dev server. Navigate to `http://ts.mlb.nih.gov:4200/`.

## Mongo

Mongo can be used as perishable storage.

- Register a free account: https://www.mongodb.com/products/platform/atlas-database
- Create `Database` called `ts-etl-ui`
- Create Collections called `users, loadRequests, loadVersions, codeSystems`
- Inject/load data from `/server/data/`

for CI, collection name appendix with ${pr_number}

for development, database name is customized per developer's environment.
You can pass `RESET_DB=true` to reset MongoDB to `/server/data/`

## Running mocking api server

Run `npm run start` to start NodeJS mocking api server

## Running test

Add `@debug` to desired test
Run `npm run test:debug` to start debug those tests

## Auto deploy latest master branch to render.com

https://ts-etl-ui-xrvh.onrender.com/
