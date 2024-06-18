import express from 'express';
import fs from 'fs';

import { getPrNumber, mongoCollection, resetMongoCollection } from './db.js';

const RESET_DB = ['true', true, 1].includes(process.env.RESET_DB);

const DEFAULT_FILE_FOLDER = 'server/data/';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('dist/ts-etl-ui/browser'));

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.get('/api/loadRequests', async (req, res) => {
  const {
    requestId,
    codeSystemName,
    requestSubject,
    type,
    requestStatus,
    requestTime,
    sort,
    order,
    pageNumber,
    pageSize,
  } = req.query;
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
  if (!!requestStatus && requestStatus !== 'null') {
    $match.requestStatus = requestStatus;
  }
  if (!!requestSubject && requestSubject !== 'null') {
    $match.requestSubject = new RegExp(escapeRegex(requestSubject), 'i');
  }
  if (!!requestTime && requestTime !== 'null') {
    const dateObj = new Date(requestTime);
    $match.requestTime = {
      $gte: dateObj,
      $lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000),
    };
  }
  const $sort = {};
  $sort[sort] = order === 'asc' ? 1 : -1;
  const pageNumberInt = Number.parseInt(pageNumber);
  const pageSizeInt = Number.parseInt(pageSize);
  const aggregation = [{ $match }, { $sort }, { $skip: pageNumberInt * pageSizeInt }, { $limit: pageSizeInt }];

  const { loadRequestsCollection } = await mongoCollection();
  const loadRequests = await loadRequestsCollection.aggregate(aggregation).toArray();
  res.send({
    total_count: await loadRequestsCollection.countDocuments(), items: loadRequests,
  });
});

async function getNextLoadRequestSequenceId(req) {
  const { loadRequestsCollection } = await mongoCollection();
  return loadRequestsCollection.countDocuments({});
}

app.post('/api/loadRequest', async (req, res) => {
  const loadRequest = req.body;

  const { loadRequestsCollection } = await mongoCollection();
  await loadRequestsCollection.insertOne({
    requestId: (await getNextLoadRequestSequenceId(req)) + 1, requestStatus: 'In Progress', ...loadRequest,
  });
  res.send();
});

app.get('/api/versionQAs', async (req, res) => {
  const { versionQAsCollection } = await mongoCollection();
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
  const { versionQAsCollection } = await mongoCollection();
  await versionQAsCollection.updateOne({ requestId: req.body.requestId }, {
    $push: {
      versionQaActivities: req.body.qaActivity,
    },
  });
  res.send();
});

app.get('/api/codeSystems', async (req, res) => {
  const { codeSystemsCollection } = await mongoCollection();
  const codeSystems = await codeSystemsCollection.find({}).toArray();
  res.send(codeSystems);
});


// in front end, go to localhost:4200/login-cb?ticket=ludetc to login as ludetc
app.get('/api/serviceValidate', async (req, res) => {
  req.hostname;

  const { usersCollection } = await mongoCollection();
  if (req.query.ticket.includes('anything')) {
    const user = await usersCollection.findOne({});
    res.send(user);
    return;
  }

  const user = await usersCollection.findOne({ 'utsUser.username': req.query.ticket });
  res.send(user);
});

app.get('/api/serverInfo', async (req, res) => {
  const pr = getPrNumber();
  const { db } = await mongoCollection();
  res.send({ pr, db: db.s.namespace.db });
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
