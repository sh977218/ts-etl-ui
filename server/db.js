import { MongoClient, ServerApiVersion } from 'mongodb';

import DEFAULT_USER_DATA from './data/user.json' assert { type: 'json' };
import DEFAULT_LOAD_REQUEST_DATA from './data/loadRequests.json' assert { type: 'json' };
import DEFAULT_LOAD_REQUEST_ACTIVITY_DATA from './data/loadRequestActivities.json' assert { type: 'json' };
import DEFAULT_VERSION_QA_DATA from './data/versionQAs.json' assert { type: 'json' };
import DEFAULT_CODE_SYSTEM_DATA from './data/codeSystem.json' assert { type: 'json' };

const pr = process.env.PR || '';
const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME || '';
const MONGO_DBNAME = process.env.MONGO_DBNAME || '';

const COLLECTIONS = [`users${pr}`, `loadRequests${pr}`, `loadRequestActivities${pr}`, `versionQAs${pr}`, `codeSystems${pr}`];

function mongoClient() {
  const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}?retryWrites=true&w=majority&appName=ts-etl-ui`;
  return new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
    },
  });
}


async function mongoDb() {
  const client = await mongoClient().connect();
  return client.db(MONGO_DBNAME);
}

export async function mongoInit() {
  const db = await mongoDb();
  return {
    db,
    usersCollection: db.collection(`users${pr}`),
    loadRequestsCollection: db.collection(`loadRequests${pr}`),
    loadRequestActivitiesCollection: db.collection(`loadRequestActivities${pr}`),
    versionQAsCollection: db.collection(`versionQAs${pr}`),
    codeSystemsCollection: db.collection(`codeSystems${pr}`),
  };
}

export async function createMongoCollections(db) {
  if (!db) {
    db = await mongoDb();
  }
  if (pr) {
    for (const collection of COLLECTIONS) {
      await db.createCollection(collection);
    }
  }
}

export async function dropMongoCollection(db) {
  if (!db) {
    db = await mongoDb();
  }
  if (pr) {
    for (const collection of COLLECTIONS) {
      await db.dropCollection(collection);
    }
  }
}

async function restoreMongoCollections(db) {
  if (!db) {
    db = await mongoDb();
  }
  await db.collection(`users${pr}`).insertMany(DEFAULT_USER_DATA.data);
  await db.collection(`loadRequests${pr}`).insertMany(DEFAULT_LOAD_REQUEST_DATA.data);
  await db.collection(`loadRequestActivities${pr}`).insertMany(DEFAULT_LOAD_REQUEST_ACTIVITY_DATA.data);
  await db.collection(`versionQAs${pr}`).insertMany(DEFAULT_VERSION_QA_DATA.data);
  await db.collection(`codeSystems${pr}`).insertMany(DEFAULT_CODE_SYSTEM_DATA.data);
}

export async function resetMongoCollection() {
  const client = mongoClient();
  await client.connect().catch(reason => {
    console.error(`Mongo connect failed in resetMongoCollection(): ${reason.toString()}`);
  });
  const db = client.db(MONGO_DBNAME);
  const pr = process.env.PR || '';
  console.log('resetting DB');
  await dropMongoCollection(db, pr);
  await createMongoCollections(db, pr);
  await restoreMongoCollections(db, pr);
  await client.close();
}