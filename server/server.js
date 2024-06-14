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
    requestDateRange,
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
  if (!!requestDateRange && requestDateRange !== 'null') {
    const now = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday of the current week
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    if (requestDateRange === 'today') {
      $match.requestTime = {
        $lte: now,
        $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      };
    } else if (requestDateRange === 'thisWeek') {
      $match.requestTime = {
        $gte: startOfWeek,
        $lte: now,
      };
    } else if (requestDateRange === 'lastWeek') {
      const startOfLastWeek = new Date();
      startOfLastWeek.setDate(startOfWeek.getDate() - 7 - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday of last current week
      startOfLastWeek.setHours(0, 0, 0, 0);
      $match.requestTime = {
        $gte: startOfLastWeek,
        $lte: startOfWeek,
      };
    } else if (requestDateRange === 'thisMonth') {
      $match.requestTime = {
        $gte: startOfMonth,
        $lte: now,
      };
    } else if (requestDateRange === 'lastMonth') {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      startOfLastMonth.setHours(0, 0, 0, 0);
      $match.requestTime = {
        $gte: startOfLastMonth,
        $lte: startOfMonth,
      };
    }
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
  loadRequest.requestTime = new Date(loadRequest.requestTime);
  await loadRequestsCollection.insertOne({
    requestId: (await getNextLoadRequestSequenceId(req)) + 1, requestStatus: 'In Progress', ...loadRequest,
  });
  res.send();
});

app.get('/api/loadRequestActivities/:requestId', async (req, res) => {
  const requestId = Number.parseInt(req.params.requestId);

  const { loadRequestActivitiesCollection } = await mongoCollection();
  const loadRequestActivities = await loadRequestActivitiesCollection.find({ requestId }).toArray();
  res.send(loadRequestActivities);
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
      activityHistory: req.body.qaActivity,
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
