import { MongoClient, ServerApiVersion } from 'mongodb';

import DEFAULT_USER_DATA from './data/user.json' assert { type: 'json' };
import DEFAULT_LOAD_REQUEST_DATA from './data/loadRequests.json' assert { type: 'json' };
import DEFAULT_LOAD_VERSION_DATA from './data/loadVersions.json' assert { type: 'json' };
import DEFAULT_CODE_SYSTEM_DATA from './data/codeSystems.json' assert { type: 'json' };
import DEFAULT_VERSION_STATUS_DATA from './data/versionStatus.json' assert { type: 'json' };
import DEFAULT_VALIDATION_RULE_DATA from './data/validationRules.json' assert { type: 'json' };
import DEFAULT_PROPERTY_DATA from './data/properties.json' assert { type: 'json' };

const IS_PULL_REQUEST = ['true', true, 1].includes(process.env.IS_PULL_REQUEST);
const PR_FROM_ENV = process.env.PR || '';
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME || '';
const MONGO_DBNAME = process.env.MONGO_DBNAME || '';

let MONGO_CLIENT;

export function getPrNumber() {
  if (PR_FROM_ENV) {
    return PR_FROM_ENV;
  }
  if (IS_PULL_REQUEST && RENDER_EXTERNAL_URL) {
    const pr_in_url_regex = /https:\/\/ts-etl-ui-pr-(\d+)\.onrender\.com/;
    const matchedArray = pr_in_url_regex.exec(RENDER_EXTERNAL_URL);
    if (matchedArray && matchedArray.length === 2) {
      return matchedArray[1].trim();
    } else {
      return '';
    }
  }
  return '';
}

function getCollections() {
  const PR_NUMBER = getPrNumber();
  return [`users${PR_NUMBER}`, `loadRequests${PR_NUMBER}`, `loadVersions${PR_NUMBER}`, `versionStatus${PR_NUMBER}`, `codeSystems${PR_NUMBER}`];
}

function mongoClient() {
  const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}?retryWrites=true&w=majority&appName=ts-etl-ui`;
  if (!MONGO_CLIENT) {
    MONGO_CLIENT = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
      },
    });
  }
  return MONGO_CLIENT;
}

async function mongoDb() {
  const client = await mongoClient().connect();
  if (IS_PULL_REQUEST) {
    return client.db('ci');
  } else {
    return client.db(MONGO_DBNAME);
  }
}

export async function mongoCollection() {
  const db = await mongoDb();
  const PR_NUMBER = getPrNumber();
  return {
    db,
    usersCollection: db.collection(`users${PR_NUMBER}`),
    loadRequestsCollection: db.collection(`loadRequests${PR_NUMBER}`),
    loadVersionsCollection: db.collection(`loadVersions${PR_NUMBER}`),
    codeSystemsCollection: db.collection(`codeSystems${PR_NUMBER}`),
    versionStatusCollection: db.collection(`versionStatus${PR_NUMBER}`),
    validationRulesCollection: db.collection(`validationRules${PR_NUMBER}`),
    propertyCollection: db.collection(`properties${PR_NUMBER}`),
  };
}

export async function createMongoCollections() {
  const client = mongoClient();
  await client.connect().catch(reason => {
    console.error(`Mongo connect failed in resetMongoCollection(): ${reason.toString()}`);
  });
  const db = client.db(MONGO_DBNAME);
  const PR_NUMBER = getPrNumber();
  console.log(`resetting DB: ${db.s.namespace.db} with pr: ${PR_NUMBER}`);
  for (const collection of getCollections()) {
    await db.createCollection(collection);
  }
  await client.close();
}

export async function dropMongoCollection() {
  const client = mongoClient();
  await client.connect().catch(reason => {
    console.error(`Mongo connect failed in resetMongoCollection(): ${reason.toString()}`);
  });
  const db = client.db(MONGO_DBNAME);
  const PR_NUMBER = getPrNumber();
  console.log(`resetting DB: ${db.s.namespace.db} with pr: ${PR_NUMBER}`);
  for (const collection of getCollections()) {
    await db.dropCollection(collection);
  }
  await client.close();
}

async function restoreMongoCollections(db) {
  const PR_NUMBER = getPrNumber();
  await db.collection(`users${PR_NUMBER}`).insertMany(DEFAULT_USER_DATA.data);
  // patch loadRequest data
  DEFAULT_LOAD_REQUEST_DATA.data.forEach(r => r.requestTime = new Date(r.requestTime));
  DEFAULT_LOAD_REQUEST_DATA.data.forEach(r => r.creationTime = new Date(r.creationTime));
  DEFAULT_LOAD_REQUEST_DATA.data.forEach(r => {
    if (r.loadStartTime) {
      r.loadStartTime = new Date(r.loadStartTime);
    } else {
      r.loadStartTime = randomDate(new Date(2010, 0, 1), new Date());
    }
  });
  DEFAULT_LOAD_REQUEST_DATA.data.forEach(r => {
    if (r.loadEndTime) {
      r.loadEndTime = new Date(r.loadEndTime);
    } else {
      r.loadEndTime = randomDate(new Date(2012, 0, 1), new Date());
    }
  });
  DEFAULT_LOAD_REQUEST_DATA.data.forEach(r => r.loadElapsedTime = r.loadEndTime - r.loadStartTime);

  // patch loadVersion data
  DEFAULT_LOAD_VERSION_DATA.data.forEach(r => r.requestTime = new Date(r.requestTime));
  DEFAULT_LOAD_VERSION_DATA.data.forEach(r => {
    if (r.loadStartTime) {
      r.loadStartTime = new Date(r.loadStartTime);
    } else {
      r.loadStartTime = randomDate(new Date(2010, 0, 1), new Date());
    }
  });
  DEFAULT_LOAD_VERSION_DATA.data.forEach(r => {
    if (r.loadEndTime) {
      r.loadEndTime = new Date(r.loadEndTime);
    } else {
      r.loadEndTime = randomDate(new Date(2012, 0, 1), new Date());
    }
  });
  DEFAULT_LOAD_VERSION_DATA.data.forEach(r => r.loadElapsedTime = r.loadEndTime - r.loadStartTime);
  await db.collection(`loadRequests${PR_NUMBER}`).insertMany(DEFAULT_LOAD_REQUEST_DATA.data);
  await db.collection(`loadVersions${PR_NUMBER}`).insertMany(DEFAULT_LOAD_VERSION_DATA.data);
  await db.collection(`codeSystems${PR_NUMBER}`).insertMany(DEFAULT_CODE_SYSTEM_DATA.data);
  await db.collection(`versionStatus${PR_NUMBER}`).insertMany(DEFAULT_VERSION_STATUS_DATA.data);
  await db.collection(`validationRules${PR_NUMBER}`).insertMany(DEFAULT_VALIDATION_RULE_DATA.data);
  await db.collection(`properties${PR_NUMBER}`).insertMany(DEFAULT_PROPERTY_DATA.data);
}

export async function resetMongoCollection() {
  const client = mongoClient();
  await client.connect().catch(reason => {
    console.error(`Mongo connect failed in resetMongoCollection(): ${reason.toString()}`);
  });
  const db = client.db(MONGO_DBNAME);
  const PR_NUMBER = getPrNumber();
  console.log(`resetting DB: ${db.s.namespace.db} with pr: ${PR_NUMBER}`);
  await restoreMongoCollections(db, PR_NUMBER);
  await client.close();
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}