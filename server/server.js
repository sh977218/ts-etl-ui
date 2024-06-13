import express from 'express';
import fs from 'fs';

import { mongoCollectionByPrNumber, resetMongoCollection } from './db.js';

const RESET_DB = ['true', true, 1].includes(process.env.RESET_DB);
const PR_NUMBER = process.env.PR || '';

const DEFAULT_FILE_FOLDER = 'server/data/';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('dist/ts-etl-ui/browser'));

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.get('/api/loadRequests', async (req, res) => {
  const { requestId, codeSystemName, requestSubject, type, sort, order, pageNumber, pageSize } = req.query;
  const $match = {};
  if (requestId !== 'null') {
    $match.requestId = Number.parseInt(requestId);
  }
  if (!!codeSystemName && codeSystemName !== 'null') {
    $match.codeSystemName = codeSystemName;
  }
  if (!!type && type !== 'null') {
    $match.type = type;
  }
  if (!!requestSubject && requestSubject !== 'null') {
    $match.requestSubject = new RegExp(escapeRegex(requestSubject), 'i');
  }
  const $sort = {};
  $sort[sort] = order === 'asc' ? 1 : -1;
  const pageNumberInt = Number.parseInt(pageNumber);
  const pageSizeInt = Number.parseInt(pageSize);
  const aggregation = [{ $match }, { $sort }, { $skip: pageNumberInt * pageSizeInt }, { $limit: pageSizeInt }];

  const DB_NAME = req.headers.db;
  const { loadRequestsCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  const loadRequests = await loadRequestsCollection.aggregate(aggregation).toArray();
  res.send({
    total_count: await loadRequestsCollection.countDocuments(), items: loadRequests,
  });
});

async function getNextLoadRequestSequenceId(req) {
  const DB_NAME = req.headers.db;
  const { loadRequestsCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  return loadRequestsCollection.countDocuments({});
}

app.post('/api/loadRequest', async (req, res) => {
  const loadRequest = req.body;

  const DB_NAME = req.headers.db;
  const { loadRequestsCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  await loadRequestsCollection.insertOne({
    requestId: (await getNextLoadRequestSequenceId(req)) + 1, requestStatus: 'In Progress', ...loadRequest,
  });
  res.send();
});

app.get('/api/loadRequestActivities/:requestId', async (req, res) => {
  const requestId = Number.parseInt(req.params.requestId);

  const DB_NAME = req.headers.db;
  const { loadRequestActivitiesCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  const loadRequestActivity = await loadRequestActivitiesCollection.findOne({ requestId });
  res.send([loadRequestActivity]);
});

app.get('/api/versionQAs', async (req, res) => {
  const DB_NAME = req.headers.db;
  const { versionQAsCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  const versionQAs = await versionQAsCollection.find({}).toArray();
  res.send({
    total_count: versionQAs.length, items: versionQAs,
  });
});

app.get('/api/file/:id', (req, res) => {
  const fileLocation = DEFAULT_FILE_FOLDER + req.params.id;
  const fileContent = fs.readFileSync(fileLocation);
  res.send(fileContent);
});

app.post('/api/qaActivity', async (req, res) => {
  const DB_NAME = req.headers.db;
  const { versionQAsCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  await versionQAsCollection.updateOne({ requestId: req.body.requestId }, {
    $push: {
      activityHistory: req.body.qaActivity,
    },
  });
  res.send();
});

app.get('/api/codeSystems', async (req, res) => {
  const DB_NAME = req.headers.db;
  const { codeSystemsCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  const codeSystems = await codeSystemsCollection.find({}).toArray();
  res.send(codeSystems);
});


// in front end, go to localhost:4200/login-cb?ticket=ludetc to login as ludetc
app.get('/api/serviceValidate', async (req, res) => {
  const DB_NAME = req.headers.db;
  const { usersCollection } = await mongoCollectionByPrNumber(PR_NUMBER, DB_NAME);
  if (req.query.ticket.includes('anything')) {
    const user = await usersCollection.findOne({});
    res.send(user);
    return;
  }
  const user = await usersCollection.findOne({ 'utsUser.username': req.query.ticket });
  res.send(user);
});

app.use((req, res, next) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  fs.createReadStream('dist/ts-etl-ui/browser/index.html').pipe(res);
});


app.listen(port, () => {
  console.log(`TS ELT UI mock server listening on port ${port}`);
  if (RESET_DB) {
    resetMongoCollection()
      .then(() => console.log('Reset DB successfully from server.js'))
      .catch(() => console.log('Reset DB failed from server.js'))
      .finally(() => console.log('Reset DB final callback from server.js'));
  }
});
