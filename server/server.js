import express from 'express';
import { readFileSync, createReadStream } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';

import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { getPrNumber, mongoCollection, resetMongoCollection } from './db.js';
import { TSError, UnauthorizedError } from './errors.js';

const RESET_DB = ['true', true, 1].includes(process.env.RESET_DB);

const DEFAULT_FILE_FOLDER = 'server/data/';

const app = express();
const port = process.env.PORT || 3000;

/*
@Todo those can be from config
*/
const COOKIE_EXPIRATION_IN_MS = 60 * 1000 * 60 * 2; // 2 hours
const SECRET_TOKEN = 'some-secret'; // should be from process.env

app.use(express.json());
app.use(cookieParser());
app.use(express.static('dist/ts-etl-ui/browser'));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.post('/load-request/list', async (req, res) => {
  const apiStartTime = new Date();
  const { pagination, searchFilters, searchColumns, sortCriteria } = req.body;
  const { pageNum, pageSize } = pagination;
  const { filterRequestTime, filterRequester } = searchFilters;
  const {
    opRequestSeq,
    codeSystemName,
    requestSubject,
    requestStatus,
    requestType,
    requestTimeFrom,
    requestTimeTo,
    requester,
    creationTimeFrom,
    creationTimeTo,
  } = searchColumns;
  const { sortBy, sortDirection } = sortCriteria;

  const $match = {};
  // searchColumns
  if (opRequestSeq) {
    $match.opRequestSeq = Number.parseInt(opRequestSeq);
  }
  if (codeSystemName) {
    $match.codeSystemName = codeSystemName;
  }
  if (requestSubject) {
    $match.requestSubject = new RegExp(escapeRegex(requestSubject), 'i');
  }
  if (requestStatus) {
    $match.requestStatus = requestStatus;
  }
  if (requestType) {
    $match.requestType = requestType;
  }
  if (requestTimeFrom) {
    const dateObj = new Date(requestTimeFrom);
    $match.requestTime = {
      $gte: dateObj,
    };
  }
  if (requestTimeTo) {
    const dateObj = new Date(requestTimeTo);
    if (!$match.requestTime) {
      $match.requestTime = {};
    }
    $match.requestTime['$lte'] = dateObj;
  }
  if (requester) {
    $match.requester = new RegExp(escapeRegex(requester), 'i');
  }

  if (creationTimeFrom) {
    const dateObj = new Date(creationTimeFrom);
    $match.creationTime = {
      $gte: dateObj,
    };
  }
  if (creationTimeTo) {
    const dateObj = new Date(creationTimeTo);
    if (!$match.creationTime) {
      $match.creationTime = {};
    }
    $match.creationTime['$lte'] = dateObj;
  }

  // searchFilters
  if (filterRequestTime) {
    const today = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday of the current week
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    if (filterRequestTime === 'today') {
      $match.requestTime = {
        $lte: today, $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      };
    } else if (filterRequestTime === 'thisWeek') {
      $match.requestTime = {
        $gte: startOfWeek, $lte: today,
      };
    } else if (filterRequestTime === 'lastWeek') {
      const startOfLastWeek = new Date();
      startOfLastWeek.setDate(startOfWeek.getDate() - 7 - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday of last current week
      startOfLastWeek.setHours(0, 0, 0, 0);
      $match.requestTime = {
        $gte: startOfLastWeek, $lte: startOfWeek,
      };
    } else if (filterRequestTime === 'thisMonth') {
      $match.requestTime = {
        $gte: startOfMonth, $lte: today,
      };
    } else if (filterRequestTime === 'lastMonth') {
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

  // pagination
  const pageNumberInt = pageNum - 1;
  const pageSizeInt = +pageSize;

  const aggregation = [{ $match }, { $sort }, { $skip: pageNumberInt * pageSizeInt }, { $limit: pageSizeInt }];
  const { loadRequestsCollection } = await mongoCollection();
  const loadRequests = await loadRequestsCollection.aggregate(aggregation).toArray();
  const apiEndTime = new Date();
  res.send({
    result: {
      data: loadRequests, hasPagination: true, pagination: {
        totalCount: await loadRequestsCollection.countDocuments($match), page: pageNumberInt, pageSize: pageSize,
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

app.delete('/api/loadRequest/:reqId', async (req, res) => {
  const { loadRequestsCollection } = await mongoCollection();

  const loadRequest = await loadRequestsCollection.findOne({ requestId: +req.params.reqId });
  if (loadRequest.requestStatus !== 'Open') {
    throw new UnauthorizedError('Only Open Requests can be canceled');
  }

  await loadRequestsCollection.deleteOne({ requestId: +req.params.reqId });
  res.send();
});

app.post('/api/loadRequest', async (req, res) => {
  const loadRequest = req.body;

  const { loadRequestsCollection } = await mongoCollection();
  loadRequest.requestTime = new Date(loadRequest.requestTime);
  const result = await loadRequestsCollection.insertOne({
    requestId: (await getNextLoadRequestSequenceId(req)) + 1, requestStatus: 'Open', ...loadRequest,
  });

  const newLoadRequest = await loadRequestsCollection.findOne({ _id: result.insertedId });
  res.send({ requestId: newLoadRequest.requestId });
});

app.post('/api/loadRequest/:reqId', async (req, res) => {
  const newLoadRequest = req.body;
  const { loadRequestsCollection } = await mongoCollection();
  const loadRequest = await loadRequestsCollection.findOne({ requestId: +req.params.reqId });
  if (loadRequest.requestStatus !== 'Open') {
    throw new UnauthorizedError('Only Open Requests can be edited');
  }

  await loadRequestsCollection.updateOne({ requestId: +req.params.reqId }, {
    $set: {
      codeSystemName: newLoadRequest.codeSystemName,
      sourceFilePath: newLoadRequest.sourceFilePath,
      requestSubject: newLoadRequest.requestSubject,
      notificationEmail: newLoadRequest.notificationEmail,
    },
  });
  const updatedLR = await loadRequestsCollection.findOne({ requestId: +req.params.reqId });
  res.send(updatedLR);
});

app.get('/api/loadRequest/:requestId', async (req, res) => {
  const { loadRequestsCollection } = await mongoCollection();
  res.send(await loadRequestsCollection.findOne({ requestId: +req.params.requestId }));
});

app.post('/api/loadVersions', async (req, res) => {
  const { order, searchColumns, sortCriteria } = req.body;
  const { sortBy, sortDirection } = sortCriteria;
  const {
    requestId,
    codeSystemName,
    requester,
    version,
    versionStatus,
    loadNumber,
    loadStartTime,
    loadEndTime,
    requestStartTime,
    requestEndTime,
  } = searchColumns;
  const { loadVersionsCollection } = await mongoCollection();
  const $match = {};
  if (requestId) {
    $match.requestId = Number.parseInt(requestId);
  }
  if (codeSystemName) {
    $match.codeSystemName = codeSystemName;
  }
  if (versionStatus) {
    $match.versionStatus = versionStatus;
  }
  if (requester) {
    $match.requester = new RegExp(escapeRegex(requester), 'i');
  }
  if (version) {
    $match.version = new RegExp(escapeRegex(version), 'i');
  }
  if (loadNumber) {
    $match.loadNumber = new RegExp(escapeRegex(loadNumber), 'i');
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
  if (loadStartTime) {
    const dateObj = new Date(loadStartTime);
    $match.loadStartTime = {
      $gte: dateObj,
    };
  }
  if (loadEndTime) {
    const dateObj = new Date(loadEndTime);
    if (!$match.loadStartTime) {
      $match.loadStartTime = {};
    }
    $match.loadStartTime['$lte'] = dateObj;
  }

  const $sort = {};
  $sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
  const aggregation = [{ $match }, { $sort }];
  const loadVersions = await loadVersionsCollection.aggregate(aggregation).toArray();
  res.send({
    total_count: loadVersions.length, items: loadVersions,
  });
});

app.get('/api/loadVersion/:requestId', async (req, res) => {
  const { loadVersionsCollection } = await mongoCollection();
  // I'm not sure requestID will end up being unique here... we can change later if needed
  const loadVersion = await loadVersionsCollection.findOne({ requestId: +req.params.requestId });
  res.send(loadVersion);
});

app.get('/api/file/:id', (req, res) => {
  const fileLocation = DEFAULT_FILE_FOLDER + req.params.id;
  const fileContent = readFileSync(fileLocation);
  res.send(fileContent);
});

app.post('/api/loadVersionActivity', async (req, res) => {
  const { loadVersionsCollection } = await mongoCollection();
  req.body.loadVersionActivity.id = new Date();
  const vQA = await loadVersionsCollection.findOne({ requestId: req.body.requestId });
  let versionStatus = { vQA };
  if (req.body.loadVersionActivity.activity === 'Accept') {
    versionStatus = 'Accepted';
  } else if (req.body.loadVersionActivity.activity === 'Reject') {
    versionStatus = 'Rejected';
  } else if (req.body.loadVersionActivity.activity === 'Reset') {
    versionStatus = 'Pending QA';
  }
  await loadVersionsCollection.updateOne({ requestId: req.body.requestId }, {
    $push: {
      loadVersionActivities: req.body.loadVersionActivity,
    }, $set: { versionStatus: versionStatus },
  });
  res.send();
});

app.post('/api/addActivityNote', async (req, res) => {
  const { loadVersionsCollection } = await mongoCollection();
  const vQA = await loadVersionsCollection.findOne({ requestId: req.body.requestId });
  if (typeof req.body.activityNote.hashtags === 'string') {
    req.body.activityNote.hashtags = req.body.activityNote.hashtags.split('\n');
  }
  if (!vQA.loadVersionActivities.length) {
    await loadVersionsCollection.updateOne({ requestId: req.body.requestId }, {
      $set: {
        'loadVersionActivities': [{
          createdBy: req.body.activityNote.createdBy, notes: [{
            createdBy: req.body.activityNote.createdBy,
            createdTime: req.body.activityNote.createdTime,
            notes: req.body.activityNote.notes,
            hashtags: req.body.activityNote.hashtags,
          }],
        }],
      },
    });
  } else {
    await loadVersionsCollection.updateOne({ requestId: req.body.requestId }, {
      $push: {
        'loadVersionActivities.0.notes': {
          createdBy: req.body.activityNote.createdBy,
          createdTime: req.body.activityNote.createdTime,
          notes: req.body.activityNote.notes,
          hashtags: req.body.activityNote.hashtags,
        },
      },
    });
  }
  res.send(await loadVersionsCollection.findOne({ requestId: req.body.requestId }));
});

app.post('/api/editAvailableDate', async (req, res) => {
  const { loadVersionsCollection } = await mongoCollection();
  await loadVersionsCollection.updateOne({ requestId: req.body.requestId }, {
    $set: {
      'loadVersionActivities.0.availableDate': new Date(req.body.newDate),
    },
  });
  res.send();
});

app.get('/api/codeSystems', async (req, res) => {
  const { codeSystemsCollection } = await mongoCollection();
  const codeSystems = await codeSystemsCollection.find({}).toArray();
  res.send(codeSystems);
});

app.get('/api/codeSystem/:codeSystemName', async (req, res) => {
  const codeSystemName = req.params.codeSystemName;
  const { codeSystemsCollection } = await mongoCollection();
  const codeSystem = await codeSystemsCollection.findOne({ codeSystemName });
  res.send(codeSystem);
});

app.get('/api/versionStatus/:codeSystemName/:version', async (req, res) => {
  const { codeSystemName, version } = req.params;
  const { versionStatusCollection } = await mongoCollection();
  const versionStatus = await versionStatusCollection.findOne({
    'summary.Code System Name': codeSystemName,
    'summary.Version': version,
  });
  res.send(versionStatus);
});

app.get('/api/versionStatusMeta/:codeSystemName', async (req, res) => {
  const { codeSystemName } = req.params;
  res.send({
    codeSystemName,
    currentVersion: 2023,
    priorVersion: 2022,
  });
});

app.get('/api/serverInfo', async (req, res) => {
  const pr = getPrNumber();
  const { db } = await mongoCollection();
  res.send({ pr, db: db.s.namespace.db });
});

app.get('/nih-login', (req, res) => {
  const returnURL = req.query.service;
  res.render('nih-login', { returnURL: returnURL });
});


/* @todo TS's backend needs to implement the following APIs. */
// this map simulate UTS ticket to username
const ticketMap = new Map([['peter-ticket', 'peterhuangnih'], ['christophe-ticket', 'ludetc']]);
app.get('/api/serviceValidate', async (req, res) => {
  const ticket = req.query.ticket;
  const service = req.query.service;
  const app = req.query.app;
  // UTS expect those 3 parameters
  if (app !== 'angular' || !service || !ticket) {
    return res.status(400).send();
  }
  const { usersCollection } = await mongoCollection();
  const utsUsername = ticketMap.get(ticket);
  const user = await usersCollection.findOne({ 'utsUser.username': utsUsername });
  if (user.utsUser) {
    const jwtToken = jwt.sign({ data: user.utsUser.username }, SECRET_TOKEN);
    res.cookie('Bearer', `${jwtToken}`, {
      expires: new Date(Date.now() + COOKIE_EXPIRATION_IN_MS),
    });
    res.send(user);
  } else {
    return res.status(401).send();
  }
});

app.get('/api/login', async (req, res) => {
  const jwtToken = req.cookies['Bearer'];
  if (!jwtToken) return res.status(401).send();
  const payload = jwt.verify(jwtToken, SECRET_TOKEN);
  const { usersCollection } = await mongoCollection();
  const user = await usersCollection.findOne({ 'utsUser.username': payload.data });
  res.send(user);
});

app.post('/api/logout', async (req, res) => {
  res.clearCookie('Bearer');
  res.send();
});
/* @todo END  */

app.use((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  createReadStream('dist/ts-etl-ui/browser/index.html').pipe(res);
});

app.use(async (err, req, res, next) => {
  if (err instanceof TSError) {
    return res.status(err.status).send(err);
  }
  return res.status(500).send({ name: 'Unexpected Error', message: 'Something broke!', status: 500 });
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
