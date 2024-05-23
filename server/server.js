const express = require('express');
const fs = require('fs');
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static('dist/ts-etl-ui/browser'))


const userData = require('./data/user.json');
const loadRequests = require('./data/loadRequests.json');
const loadRequestActivities = require('./data/loadRequestActivities.json');

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
  const paginatedArray = sortedArray.slice(startPos, endPos)
  return paginatedArray
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
  }, 1000)
});

app.post('/api/loadRequest', (req, res) => {
  const loadRequest = req.body;
  loadRequest.requestId = loadRequests.length;
  loadRequests.push(loadRequest);
  res.status(200).send();
})

app.get('/api/loadRequestActivities/:requestId', (req, res) => {
  const requestId = Number.parseInt(req.params.requestId);
  const filteredLoadRequestActivities = loadRequestActivities.filter(loadRequestActivity => loadRequestActivity.requestId === requestId)
  if (filteredLoadRequestActivities.length) {
    res.status(200).send(filteredLoadRequestActivities);
  } else {
    res.status(404).send();
  }
})

// in front end, go to localhost:4200/login-cb?ticket=ludetc to login as ludetc
app.get('/api/serviceValidate', (req, res) => {
  const user = userData.data.users.find(u => u.utsUser.username === req.query.ticket) || userData.data.users[0];
  res.send(user);
})

app.use((req, res, next) => {
  res.writeHead(200, { 'content-type': 'text/html' })
  fs.createReadStream('dist/ts-etl-ui/browser/index.html').pipe(res)
});


app.listen(port, () => {
  console.log(`TS ELT UI mock server listening on port ${port}`);
});
