import express from 'express';
import { createReadStream, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import jwt from 'jsonwebtoken';

import cookieParser from 'cookie-parser';
import { getPrNumber, mongoCollection, resetMongoCollection } from './db.js';
import { TSError, UnauthorizedError } from './errors.js';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RESET_DB = ['true', true, 1].includes(process.env.RESET_DB);
const MONGO_DBNAME = process.env.MONGO_DBNAME || '';

const DEFAULT_FILE_FOLDER = 'server/data/';

const app = express();
const port = process.env.PORT || 3000;

/*
@Todo those can be from config
*/
const COOKIE_EXPIRATION_IN_MS = ['prod'].includes(process.env.ENV_NAME) ? 60 * 1000 * 60 * 2 : 60 * 1000 * 60 * 8; // 2 hours on prod, 8 hours on dev
const SECRET_TOKEN = process.env.SECRET_TOKEN || 'some-secret';

app.use(express.json());
app.use(cookieParser());
app.use(cors());

if (['coverage'].includes(process.env.ENV_NAME)) {
  if (!existsSync('../dist/e2e-coverage')) {
    throw new Error(`e2e-coverage in dist not exist, try run 'npm run build:coverage'`);
  }
  app.use(express.static('../dist/e2e-coverage'));
} else {
  if (!existsSync('../dist/ts-etl-ui/browser')) {
    throw new Error(`ts-etl-ui/browser in dist not exist, try run 'npm run build'`);
  }
  app.use(express.static('../dist/ts-etl-ui/browser'));
}

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

//search LR
app.post('/api/load-request/list', async (req, res) => {
  const apiStartTime = new Date();
  const { pagination, searchFilters, searchColumns, sortCriteria } = req.body;
  const { pageNum, pageSize } = pagination;
  const { filterRequestTime, filterRequester } = searchFilters;
  let {
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
  if (codeSystemName && codeSystemName.length) {
    if (typeof codeSystemName === 'string') {
      codeSystemName = [codeSystemName];
    }
    $match.codeSystemName = {
      $in: codeSystemName,
    };
  }
  if (requestSubject) {
    $match.requestSubject = new RegExp(escapeRegex(requestSubject), 'i');
  }
  if (requestStatus && requestStatus.length) {
    if (typeof requestStatus === 'string') {
      requestStatus = [requestStatus];
    }
    $match.requestStatus = {
      $in: requestStatus,
    };
  }
  if (requestType && requestType.length) {
    if (typeof requestType === 'string') {
      requestType = [requestType];
    }
    $match.requestType = {
      $in: requestType,
    };
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
    const startOfToday = moment().startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();

    const startOfThisWeek = moment().startOf('week').toDate();
    const endOfThisWeek = moment().endOf('week').toDate();

    const startOfThisMonth = moment().startOf('month').toDate();
    const endOfThisMonth = moment().endOf('month').toDate();

    const lastMonth = moment().subtract(1, 'months');
    const startOfLastMonth = lastMonth.startOf('month').toDate();
    const endOfLastMonth = lastMonth.endOf('month').toDate();
    if (filterRequestTime === 'today') {
      $match.requestTime = {
        $gte: startOfToday, $lte: endOfToday,
      };
    } else if (filterRequestTime === 'thisWeek') {
      $match.requestTime = {
        $gte: startOfThisWeek, $lte: endOfThisWeek,
      };
    } else if (filterRequestTime === 'lastWeek') {
      const startOfLastWeek = new Date();
      $match.requestTime = {
        $gte: startOfLastWeek, $lte: startOfThisWeek,
      };
    } else if (filterRequestTime === 'thisMonth') {
      $match.requestTime = {
        $gte: startOfThisMonth, $lte: endOfThisMonth,
      };
    } else if (filterRequestTime === 'lastMonth') {
      $match.requestTime = {
        $gte: startOfLastMonth, $lte: endOfLastMonth,
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

  const lookup = [{
    $lookup: {
      from: 'loadVersions', localField: 'loadNumber', foreignField: 'loadNumber', as: 'loadVersionData',
    },
  }, {
    $addFields: {
      loadComponents: {
        $cond: {
          if: { $eq: [{ $size: '$loadVersionData' }, 0] },
          then: [],
          else: { $arrayElemAt: ['$loadVersionData.loadSummary.components', 0] },
        },
      },
    },
  }, {
    $project: {
      loadVersionData: 0,
    },
  }];

  const aggregation = [{ $match }, ...lookup, { $sort }, { $skip: pageNumberInt * pageSizeInt }, { $limit: pageSizeInt }];
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

//Cancel LR
app.post('/api/load-request/cancel/:opRequestSeq', async (req, res) => {
  const { loadRequestsCollection } = await mongoCollection();

  const loadRequest = await loadRequestsCollection.findOne({ opRequestSeq: +req.params.opRequestSeq });
  if (loadRequest.requestStatus !== 'Open') {
    throw new UnauthorizedError('Only Open Requests can be canceled');
  }
  await loadRequestsCollection.updateOne({ opRequestSeq: +req.params.opRequestSeq }, {
    $set: { requestStatus: 'Cancelled' },
  });
  res.send();
});

//create LR
app.post('/api/load-request', async (req, res) => {
  const apiStartTime = new Date();
  const loadRequest = req.body;

  const jwtToken = req.cookies['Bearer'];
  if (!jwtToken) return res.status(401).send();
  const payload = jwt.verify(jwtToken, SECRET_TOKEN);
  loadRequest.requester = payload.data;

  loadRequest.requestTime = new Date(loadRequest.requestTime);
  loadRequest.creationTime = new Date();

  const { loadRequestsCollection } = await mongoCollection();
  const result = await loadRequestsCollection.insertOne({
    opRequestSeq: (await getNextLoadRequestSequenceId(req)) + 1, requestStatus: 'Open', ...loadRequest,
  });

  const newLoadRequest = await loadRequestsCollection.findOne({ _id: result.insertedId });
  const apiEndTime = new Date();
  res.send({
    result: {
      data: newLoadRequest.opRequestSeq, hasPagination: false,
    },
    service: { url: req.url, accessTime: apiStartTime, duration: apiEndTime - apiStartTime },
    status: { success: true },
  });
});

//edit LR
app.post('/api/loadRequest/:opRequestSeq', async (req, res) => {
  const newLoadRequest = req.body;
  const { loadRequestsCollection, loadVersionsCollection } = await mongoCollection();
  const loadRequest = await loadRequestsCollection.findOne({ opRequestSeq: +req.params.opRequestSeq });
  if (loadRequest.requestStatus !== 'Open') {
    throw new UnauthorizedError('Only Open Requests can be edited');
  }

  await loadRequestsCollection.updateOne({ opRequestSeq: +req.params.opRequestSeq }, {
    $set: {
      codeSystemName: newLoadRequest.codeSystemName,
      requestType: newLoadRequest.requestType,
      sourceFilePath: newLoadRequest.sourceFilePath,
      requestSubject: newLoadRequest.requestSubject,
      notificationEmail: newLoadRequest.notificationEmail,
    },
  });
  const updatedLR = await loadRequestsCollection.findOne({ opRequestSeq: +req.params.opRequestSeq });
  const updatedLV = await loadVersionsCollection.findOne({ requestId: +req.params.opRequestSeq });
  if (updatedLV && updatedLV.loadComponents) {
    updatedLR.loadComponents = [updatedLV.loadComponents];
  } else {
    updatedLR.loadComponents = [];
  }
  res.send(updatedLR);
});

// get LR detail
app.get('/api/load-request/:opRequestSeq', async (req, res) => {
  const apiStartTime = new Date();
  const { loadRequestsCollection, loadVersionsCollection } = await mongoCollection();
  const lr = await loadRequestsCollection.findOne({ opRequestSeq: +req.params.opRequestSeq });
  const lv = await loadVersionsCollection.findOne({ requestId: +req.params.opRequestSeq });
  if (!lr) return res.status(404).send();
  const loadRequestMessageList = lv?.loadSummary?.components?.reduce((previousValue, currentValue, currentIndex, messages) => {
    return [
      ...previousValue,
      ...currentValue.errors,
      ...currentValue.infos,
      ...currentValue.warnings,
    ];
  }, []) || [];
  const loadComponentList = lv?.loadSummary?.components?.map((currentValue) => {
    return {
      'componentName': currentValue.componentName,
      'componentStatus': currentValue.status,
      'componentStartTime': currentValue.startTime,
      'componentEndTime': currentValue.endTime,
      'error': currentValue.errors.length,
      'warning': currentValue.warnings.length,
      'info': currentValue.infos.length,
    };
  }) || [];
  const loadComponentMessageList = lv?.loadSummary?.components?.reduce((previousValue, currentValue, currentIndex, messages) => {
    return [
      ...previousValue,
      ...currentValue.errors.map(error => {
        return {
          ...error,
          componentName: currentValue.componentName,
          messageGroup: 'Error',
        };
      }),
      ...currentValue.infos.map(info => {
        return {
          ...info,
          componentName: currentValue.componentName,
          messageGroup: 'Info',
        };
      }),
      ...currentValue.warnings.map(warning => {
        return {
          ...warning,
          componentName: currentValue.componentName,
          messageGroup: 'Warning',
        };
      })];
  }, []) || [];

  const lrResult = {
    'loadRequestSummary': {
      'opRequestSeq': lr.opRequestSeq,
      'codeSystemName': lr.codeSystemName,
      'requestSubject': lr.requestSubject,
      'sourceFilePath': lr.sourceFilePath,
      'requestType': lr.requestType,
      'requestTime': lr.requestTime,
      'requester': lr.requester,
      'requesterUsername': '',
      'creationTime': lr.creationTime,
      'requestStatus': lr.requestStatus,
      'loadNumber': lr.loadNumber,
      'loadStatus': lr.versionStatus,
      'loadStartTime': lr.loadStartTime,
      'loadEndTime': lr.loadEndTime,
      'loadRequestMessageList': loadRequestMessageList,
    },
    'loadComponentList': loadComponentList,
    'loadComponentMessageList': loadComponentMessageList,
  };
  const apiEndTime = new Date();
  res.send({
    result: {
      data: lrResult,
      hasPagination: false,
      pagination: null,
    },
    service: { url: req.url, accessTime: apiStartTime, duration: apiEndTime - apiStartTime },
    status: { success: true },
  });
});

app.post('/api/loadVersions', async (req, res) => {
  const { searchColumns, sortCriteria } = req.body;
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
    requestTimeFrom,
    requestTimeTo,
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
    'summary.Code System Name': codeSystemName, 'summary.Version': version,
  });
  res.send(versionStatus);
});

app.get('/api/versionStatusMeta/:codeSystemName', async (req, res) => {
  const { codeSystemName } = req.params;
  res.send({
    codeSystemName, currentVersion: 2023, priorVersion: 2022,
  });
});

app.get('/api/property/code-system/list', async (req, res) => {
  const apiStartTime = new Date();
  const { propertyCollection } = await mongoCollection();
  const property = await propertyCollection.findOne({ propertyName: 'create-request-code-systems' });
  const list = property.value;
  const apiEndTime = new Date();
  res.send({
    result: {
      data: list.map(item => {
        return {
          codeSystemName: item,
        };
      }), hasPagination: false, pagination: {
        totalCount: list.length, page: 1, pageSize: 0,
      },
    },
    service: { url: req.url, accessTime: apiStartTime, duration: apiEndTime - apiStartTime },
    status: { success: true },
  });
});

app.get('/api/property/data-files/:codeSystemName', async (req, res) => {
  const apiStartTime = new Date();
  const { codeSystemName } = req.params;
  const { propertyCollection } = await mongoCollection();
  const property = await propertyCollection.findOne({ propertyName: 'data-files' });
  const dataFileMap = property.value;
  const list = dataFileMap[codeSystemName] || [];
  const apiEndTime = new Date();
  res.send({
    result: {
      data: list, hasPagination: false, pagination: {
        totalCount: list.length, page: 1, pageSize: 0,
      },
    },
    service: { url: req.url, accessTime: apiStartTime, duration: apiEndTime - apiStartTime },
    status: { success: true },
  });
});

app.get('/api/property/:propertyName', async (req, res) => {
  const apiStartTime = new Date();
  const { propertyName } = req.params;
  const { propertyCollection } = await mongoCollection();
  const property = await propertyCollection.findOne({ propertyName });
  const list = property.value;
  const apiEndTime = new Date();
  res.send({
    result: {
      data: list.map(item => {
        return {
          value: item,
        };
      }), hasPagination: false, pagination: {
        totalCount: list.length, page: 1, pageSize: 0,
      },
    },
    service: { url: req.url, accessTime: apiStartTime, duration: apiEndTime - apiStartTime },
    status: { success: true },
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
// this map simulate UTS ticket to username, NOTE: user `ghost` exist in UTS DB but not in TS DB (Do not add user 'ghost' in data/user.json).
const ticketMap = new Map([['peter-ticket', 'peterhuang'], ['christophe-ticket', 'ludetc'], ['ghost-ticket', 'ghost']]);
app.get('/api/serviceValidate', async (req, res) => {
  const ticket = req.query.ticket;
  const service = req.query.service;
  const app = req.query.app;
  // UTS expect those 3 parameters
  if (app !== 'angular' || !service || !ticket) {
    return res.status(400).send();
  }
  const user = await loginWithUts(ticket);
  if (!user || !user.utsUser || !user.utsUser.sub) {
    return res.status(404).send();
  }
  const jwtToken = jwt.sign(user.utsUser, SECRET_TOKEN);
  res.cookie('Bearer', `${jwtToken}`, {
    expires: new Date(Date.now() + COOKIE_EXPIRATION_IN_MS),
  });
  res.send(user);
});

async function loginWithUts(ticket) {
  const { usersCollection } = await mongoCollection();
  const utsUsername = ticketMap.get(ticket);
  return await usersCollection.findOne({ 'utsUser.sub': utsUsername });
}

app.get('/api/login', async (req, res) => {
  const jwtToken = req.cookies['Bearer'];
  if (!jwtToken) return res.status(401).send();
  let payload;
  try {
    payload = jwt.verify(jwtToken, SECRET_TOKEN);
  } catch (e) {
    return res.send(500);
  }
  if (!payload) {
    return res.send(500);
  }
  const { usersCollection } = await mongoCollection();
  const user = await usersCollection.findOne({ 'utsUser.sub': payload.data });
  res.send(user);

});

app.post('/api/logout', async (req, res) => {
  res.clearCookie('Bearer');
  res.send();
});
/* @todo END  */

app.use((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  if (['coverage'].includes(process.env.ENV_NAME)) {
    if (!existsSync('../dist/e2e-coverage')) {
      throw new Error(`e2e-coverage in dist not exist, try run 'npm run build:coverage'`);
    }
    createReadStream('../dist/e2e-coverage/index.html').pipe(res);
  } else {
    if (!existsSync('../dist/ts-etl-ui/browser')) {
      throw new Error(`ts-etl-ui/browser in dist not exist, try run 'npm run build'`);
    }
    createReadStream('../dist/ts-etl-ui/browser/index.html').pipe(res);
  }
});

app.use(async (err, req, res) => {
  if (err instanceof TSError) {
    return res.status(err.status).send(err);
  }
  return res.status(500).send({ name: 'Unexpected Error', message: 'Something broke!', status: 500 });
});

app.listen(port, () => {
  console.log(`TS ELT UI mock server listening on port ${port}, using DB: ${MONGO_DBNAME}`);
  if (RESET_DB) {
    resetMongoCollection()
      .then(() => console.log('Reset DB successfully from server.js'))
      .catch(() => console.log('Reset DB failed from server.js'))
      .finally(() => console.log('Reset DB final callback from server.js'));
  }
});
