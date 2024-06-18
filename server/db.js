import { MongoClient, ServerApiVersion } from 'mongodb';

import DEFAULT_USER_DATA from './data/user.json' assert { type: 'json' };
import DEFAULT_LOAD_REQUEST_DATA from './data/loadRequests.json' assert { type: 'json' };
import DEFAULT_LOAD_REQUEST_ACTIVITY_DATA from './data/loadRequestActivities.json' assert { type: 'json' };
import DEFAULT_VERSION_QA_DATA from './data/versionQAs.json' assert { type: 'json' };
import DEFAULT_CODE_SYSTEM_DATA from './data/codeSystem.json' assert { type: 'json' };

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
      const pr_in_url = matchedArray[1].trim();
      return pr_in_url;
    } else {
      return '';
    }
  }
  return '';
}

function getCollections() {
  const PR_NUMBER = getPrNumber();
  return [`users${PR_NUMBER}`, `loadRequests${PR_NUMBER}`, `loadRequestActivities${PR_NUMBER}`, `versionQAs${PR_NUMBER}`, `codeSystems${PR_NUMBER}`];
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
    loadRequestActivitiesCollection: db.collection(`loadRequestActivities${PR_NUMBER}`),
    versionQAsCollection: db.collection(`versionQAs${PR_NUMBER}`),
    codeSystemsCollection: db.collection(`codeSystems${PR_NUMBER}`),
  };
}

export async function createMongoCollections(db) {
  for (const collection of getCollections()) {
    await db.createCollection(collection);
  }
}

export async function dropMongoCollection(db) {
  if (!db) {
    db = await mongoDb();
  }
  for (const collection of getCollections()) {
    await db.dropCollection(collection);
  }
}

async function restoreMongoCollections(db) {
  const PR_NUMBER = getPrNumber();
  await db.collection(`users${PR_NUMBER}`).insertMany(DEFAULT_USER_DATA.data);
  DEFAULT_LOAD_REQUEST_DATA.data.forEach(r => r.requestTime = new Date(r.requestTime));
  await db.collection(`loadRequests${PR_NUMBER}`).insertMany(DEFAULT_LOAD_REQUEST_DATA.data);
  await db.collection(`loadRequestActivities${PR_NUMBER}`).insertMany(DEFAULT_LOAD_REQUEST_ACTIVITY_DATA.data);
  await db.collection(`versionQAs${PR_NUMBER}`).insertMany(DEFAULT_VERSION_QA_DATA.data);
  await db.collection(`codeSystems${PR_NUMBER}`).insertMany(DEFAULT_CODE_SYSTEM_DATA.data);
}

export async function resetMongoCollection() {
  const client = mongoClient();
  await client.connect().catch(reason => {
    console.error(`Mongo connect failed in resetMongoCollection(): ${reason.toString()}`);
  });
  const db = client.db(MONGO_DBNAME);
  const PR_NUMBER = getPrNumber();
  console.log('resetting DB');
  await dropMongoCollection(db, PR_NUMBER);
  await createMongoCollections(db, PR_NUMBER);
  await restoreMongoCollections(db, PR_NUMBER);
  await client.close();
}
