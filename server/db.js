import { MongoClient, ServerApiVersion } from 'mongodb';

import DEFAULT_USER_DATA from './data/user.json' assert { type: 'json' };
import DEFAULT_LOAD_REQUEST_DATA from './data/loadRequests.json' assert { type: 'json' };
import DEFAULT_LOAD_REQUEST_ACTIVITY_DATA from './data/loadRequestActivities.json' assert { type: 'json' };
import DEFAULT_VERSION_QA_DATA from './data/versionQAs.json' assert { type: 'json' };

const pr = '' || process.env.PR;
const MONGO_USERNAME = '' || process.env.MONGO_USERNAME;
const MONGO_PASSWORD = '' || process.env.MONGO_PASSWORD;
const MONGO_HOSTNAME = '' || process.env.MONGO_HOSTNAME;

export async function connectToMongo() {
    const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}?retryWrites=true&w=majority&appName=ts-etl-ui`;
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    await client.connect();
    const db = await client.db('ts-etl-ui')
    if (pr) {
        await restoreMongoDb(db);
    }
    return {
        db,
        usersCollection: db.collection(`users${pr}`),
        loadRequestsCollection: db.collection(`loadRequests${pr}`),
        loadRequestActivitiesCollection: db.collection(`loadRequestActivities${pr}`),
        versionQAsCollection: db.collection(`versionQAs${pr}`)
    };
}

async function restoreMongoDb(db) {
    for (const collection of [`users${pr}`, `loadRequests${pr}`, `loadRequestActivities${pr}`, `versionQAs${pr}`]) {
        await db.dropCollection(collection);
        await db.createCollection(collection);
    }
    await db.collection(`users${pr}`).insertMany(DEFAULT_USER_DATA.data)
    await db.collection(`loadRequests${pr}`).insertMany(DEFAULT_LOAD_REQUEST_DATA.data)
    await db.collection(`loadRequestActivities${pr}`).insertMany(DEFAULT_LOAD_REQUEST_ACTIVITY_DATA.data)
    await db.collection(`versionQAs${pr}`).insertMany(DEFAULT_VERSION_QA_DATA.data)
}
