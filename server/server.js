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

app.post('/api/loadRequests', async (req, res) => {
  const apiStartTime = new Date();
  const { pagination, searchFilters, searchColumns, sortCriteria } = req.body;
  const { pageNum, pageSize } = pagination;
<<<<<<< HEAD
  const { filterRequestTime, filterRequester } = searchFilters;
=======
  const { requestTime, requester } = searchFilters;
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
  const {
    codeSystemName,
<<<<<<< HEAD
    requestSubject,
    requestStatus,
    requestType,
    requestStartTime,
    requestEndTime,
    requester,
    creationStartTime,
    creationEndTime,
=======
    requestEndTime,
    requestId,
    requestStartTime,
    requestStatus,
    requestSubject,
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
  } = searchColumns;
  const { sortBy, sortDirection } = sortCriteria;

  const $match = {};
<<<<<<< HEAD
  // searchColumns
=======
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
  if (requestId) {
    $match.requestId = Number.parseInt(requestId);
  }
  if (codeSystemName) {
    $match.codeSystemName = codeSystemName;
  }
<<<<<<< HEAD
  if (requestSubject) {
    $match.requestSubject = new RegExp(escapeRegex(requestSubject), 'i');
=======
  if (requestTime) {
    $match.requestTime = requestTime;
  }
  if (requester) {
    $match.requester = requester;
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
  }
  if (requestStatus) {
    $match.requestStatus = requestStatus;
  }
  if (requestType) {
    $match.requestType = requestType;
  }
  if (requestStartTime) {
    const dateObj = new Date(requestStartTime);
    $match.requestTime = {
      $gte: dateObj,
    };
  }
  if (requestEndTime) {
    const dateObj = new Date(requestEndTime);
    if (!$match.requestTime) {
      $match.requestTime = {};
    }
    $match.requestTime['$lte'] = dateObj;
  }
<<<<<<< HEAD
  if (requester) {
    $match.requester = new RegExp(escapeRegex(requester), 'i');
  }

  if (creationStartTime) {
    const dateObj = new Date(creationStartTime);
    $match.creationTime = {
      $gte: dateObj,
    };
  }
  if (creationEndTime) {
    const dateObj = new Date(creationEndTime);
    if (!$match.creationTime) {
      $match.creationTime = {};
=======
  /*
    if (creationTimeStart) {
      const dateObj = new Date(creationTimeStart);
      $match.creationTime = {
        $gte: dateObj,
      };
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
    }
    if (creationTimeEnd) {
      const dateObj = new Date(creationTimeEnd);
      if (!$match.creationTime) {
        $match.creationTime = {};
      }
      $match.creationTime['$lte'] = dateObj;
    }
  */

<<<<<<< HEAD
  // searchFilters
  if (filterRequestTime) {
=======
  if (requestTime) {
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
    const today = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday of the current week
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
<<<<<<< HEAD
    if (filterRequestTime === 'today') {
      $match.requestTime = {
        $lte: today, $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      };
    } else if (filterRequestTime === 'thisWeek') {
      $match.requestTime = {
        $gte: startOfWeek, $lte: today,
      };
    } else if (filterRequestTime === 'lastWeek') {
=======
    if (requestTime === 'today') {
      $match.requestTime = {
        $lte: today, $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      };
    } else if (requestTime === 'thisWeek') {
      $match.requestTime = {
        $gte: startOfWeek, $lte: today,
      };
    } else if (requestTime === 'lastWeek') {
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
      const startOfLastWeek = new Date();
      startOfLastWeek.setDate(startOfWeek.getDate() - 7 - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday of last current week
      startOfLastWeek.setHours(0, 0, 0, 0);
      $match.requestTime = {
        $gte: startOfLastWeek, $lte: startOfWeek,
      };
<<<<<<< HEAD
    } else if (filterRequestTime === 'thisMonth') {
      $match.requestTime = {
        $gte: startOfMonth, $lte: today,
      };
    } else if (filterRequestTime === 'lastMonth') {
=======
    } else if (requestTime === 'thisMonth') {
      $match.requestTime = {
        $gte: startOfMonth, $lte: today,
      };
    } else if (requestTime === 'lastMonth') {
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      startOfLastMonth.setHours(0, 0, 0, 0);
      $match.requestTime = {
        $gte: startOfLastMonth, $lte: startOfMonth,
      };
    }
  }

  if (filterRequester) {
    $match.requester = filterRequester;
  }

  // sortCriteria
  const $sort = {};
  $sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
<<<<<<< HEAD

  // pagination
=======
>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
  const pageNumberInt = pageNum - 1;
  const pageSizeInt = +pageSize;

  const aggregation = [{ $match }, { $sort }, { $skip: pageNumberInt * pageSizeInt }, { $limit: pageSizeInt }];
  const { loadRequestsCollection } = await mongoCollection();
  const loadRequests = await loadRequestsCollection.aggregate(aggregation).toArray();
<<<<<<< HEAD
=======

>>>>>>> d9f9c510a67980dfc16257ffa2ae0e499e010d91
  const apiEndTime = new Date();
  res.send({
    result: {
      data: loadRequests,
      hasPagination: true,
      pagination: {
        totalCount: await loadRequestsCollection.countDocuments($match),
        page: pageNumberInt,
        pageSize: pageSize,
      },
    },
    service: { url: req.url, accessTime: apiStartTime, duration: apiEndTime - apiStartTime },
    status: { success: true },
  });
});

async function getNextLoadRequestSequenceId() {
  const { loadRequestsCollection } = await mongoCollection();
  return loadRequestsCollection.countDocuments({});
}

app.post('/api/loadRequest', async (req, res) => {
  const loadRequest = req.body;

  const { loadRequestsCollection } = await mongoCollection();
  loadRequest.requestTime = new Date(loadRequest.requestTime);
  const result = await loadRequestsCollection.insertOne({
    requestId: (await getNextLoadRequestSequenceId(req)) + 1, requestStatus: 'In Progress', ...loadRequest,
  });

  const newLoadRequest = await loadRequestsCollection.findOne({ _id: result.insertedId });
  res.send({ requestId: newLoadRequest.requestId });
});

app.post('/api/versionQAs', async (req, res) => {
  const { loadNumber, sort, order } = req.body;
  const { versionQAsCollection } = await mongoCollection();
  const $match = {};
  if (loadNumber !== null) {
    $match.loadNumber = loadNumber;
  }

  const $sort = {};
  $sort[sort] = order === 'asc' ? 1 : -1;
  const aggregation = [{ $match }, { $sort }];
  const versionQAs = await versionQAsCollection.aggregate(aggregation).toArray();
  res.send({
    total_count: versionQAs.length, items: versionQAs,
  });
});

app.get('/api/versionQA/:requestId', async (req, res) => {
  const { versionQAsCollection } = await mongoCollection();
  // I'm not sure requestID will end up being unique here... we can change later if needed
  const versionQA = await versionQAsCollection.findOne({ requestId: +req.params.requestId });
  res.send(versionQA);
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

app.post('/api/editAvailableDate', async (req, res) =>  {
  const { versionQAsCollection } = await mongoCollection();
  await versionQAsCollection.updateOne({ requestId: req.body.requestId }, {
    $set: {
      "versionQaActivities.0.availableDate": new Date(req.body.newDate),
    },
  });
  res.send();
})

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
