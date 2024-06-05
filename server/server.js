import express from 'express';
import fs from 'fs';

const DEFAULT_FILE_FOLDER = 'server/data/'

import DEFAULT_USER_DATA from './data/user.json' assert {type: 'json'};
import DEFAULT_LOAD_REQUEST_DATA from './data/loadRequests.json' assert {type: 'json'};
import DEFAULT_LOAD_REQUEST_ACTIVITY_DATA from './data/loadRequestActivities.json' assert {type: 'json'};
import DEFAULT_VERSION_QA_DATA from './data/versionQAs.json' assert {type: 'json'};

import {createOrReplaceCollection, getCollection, saveCollection} from './db.js';

const app = express()
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static('dist/ts-etl-ui/browser'))

let userData;
let loadRequests;
let loadRequestActivities;
let versionQAs;

async function loadMockData(collType, defaultData) {
  const PANTRY_ID = process.env.PANTRY_ID;
  if (!PANTRY_ID) {
    return defaultData.data;
  }
  await createOrReplaceCollection(collType);
  let dbData = await getCollection(collType);
  if (dbData && dbData.data) {
    return dbData.data;
  }
  return defaultData.data;
}

async function loadAllMockData() {
  let pr = '' || process.env.PR;
  userData = await loadMockData(`users${pr}`, DEFAULT_USER_DATA);
  loadRequests = await loadMockData(`loadRequests${pr}`, DEFAULT_LOAD_REQUEST_DATA);
  loadRequestActivities = await loadMockData(`loadRequestActivities${pr}`, DEFAULT_LOAD_REQUEST_ACTIVITY_DATA);
  versionQAs = await loadMockData(`versionQAs${pr}`, DEFAULT_VERSION_QA_DATA);
}

loadAllMockData().then(() => {
}, (reason) => {
  console.log(
    '********** Expected error: ************\n',
    `${reason}\n`,
    '*************************************\n'
  )
});

function filterByFieldsFunc(obj, term, fields) {
  let found = false;
  if (!fields) {
    fields = Object.keys(obj)
  }
  for (const k of fields) {
    const v = obj[k].toString();
    if (v.includes && v.includes(term)) {
      found = true;
    }
  }
  return !term || found;
}

function sortByFieldFunc(obj1, obj2, sort, order) {
  const value1 = obj1[sort];
  const value2 = obj2[sort];
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    if (order === 'asc') {
      return obj1[sort] - obj2[sort];
    } else {
      return obj2[sort] - obj1[sort]
    }
  } else {
    if (order === 'asc') {
      return obj1[sort].toString().localeCompare(obj2[sort].toString())
    } else {
      return obj2[sort].toString().localeCompare(obj1[sort].toString())
    }
  }
}

function calculate(originalArray, term, sort, order, pageNumber, pageSize) {
  const filteredArray = originalArray.filter(obj => {
    return filterByFieldsFunc(obj, term)
  })
  const sortedArray = filteredArray.sort((a, b) => {
    return sortByFieldFunc(a, b, sort, order)
  })

  const startPos = pageNumber * pageSize;
  const endPos = (pageNumber + 1) * pageSize
  return sortedArray.slice(startPos, endPos)
}

function formatResponse(originalArray, paginatedArray) {
  return {
    total_count: originalArray.length,
    items: paginatedArray,
  }
}

app.get('/api/loadRequests', (req, res) => {
  const {q, sort, order, pageNumber, pageSize} = req.query;
  const paginatedArray = calculate(loadRequests, q, sort, order, Number.parseInt(pageNumber), Number.parseInt(pageSize))

  // simulating a delay network to test application's resilience
  setTimeout(() => {
    res.status(200).send(formatResponse(loadRequests, paginatedArray));
  }, Math.floor(Math.random() * 1500) + 1)
});

app.post('/api/loadRequest', async (req, res) => {
  const loadRequest = req.body;
  loadRequest.requestId = loadRequests.length;
  loadRequest.requestStatus = 'In Progress';
  loadRequests.push(loadRequest);
  await saveCollection('loadRequests1', {data: loadRequests});
  res.status(200).send();
})

app.get('/api/loadRequestActivities/:requestId', (req, res) => {
  const requestId = Number.parseInt(req.params.requestId);
  const filteredLoadRequestActivities = loadRequestActivities.filter(loadRequestActivity => loadRequestActivity.requestId === requestId)
  // simulating a delay network to test application's resilience
  setTimeout(() => {
    if (filteredLoadRequestActivities.length) {
      res.status(200).send(filteredLoadRequestActivities);
    } else {
      const randomFail = (Math.floor(Math.random() * 2)) % 2;
      res.status(randomFail ? 404 : 500).send();
    }
  }, Math.floor(Math.random() * 1500) + 1)
})

app.get("/api/versionQAs", (req, res) => {
  // simulating a delay network to test application's resilience
  setTimeout(() => {
    res.status(200).send(formatResponse(versionQAs, versionQAs));
  }, Math.floor(Math.random() * 1500) + 1);
});

app.get("/api/file/:id", (req,res) => {
    const fileLocation = DEFAULT_FILE_FOLDER + req.params.id;
    const fileContent = fs.readFileSync(fileLocation);
    res.send(fileContent)
});

app.post('/api/qaActivity', async (req, res) => {
  const versionQA = versionQAs.find(v => v.requestId === req.body.requestId);
  if (!versionQA.activityHistory) {
    versionQA.activityHistory = [];
  }
  versionQA.activityHistory.push(req.body.qaActivity);
  await saveCollection('versionQA1', {data: versionQA});
  res.send();
})

// in front end, go to localhost:4200/login-cb?ticket=ludetc to login as ludetc
app.get('/api/serviceValidate', (req, res) => {
  const user = userData.find(u => u.utsUser.username === req.query.ticket) || userData[0];
  res.send(user);
})

app.use((req, res, next) => {
  res.writeHead(200, {'content-type': 'text/html'})
  fs.createReadStream('dist/ts-etl-ui/browser/index.html').pipe(res)
});


app.listen(port, () => {
  console.log(`TS ELT UI mock server listening on port ${port}`);

  if (!process.env.PANTRY_ID) {
    console.warn('No PANTRY_ID configured. Using local in-memory cache.')
  }
});
