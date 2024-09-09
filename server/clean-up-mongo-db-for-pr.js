import { dropMongoCollection } from './db.js';

const pr = process.env.PR || '';

dropMongoCollection()
  .then(() => {
    console.log(`Dropped all mongo db of pr ${pr}`);
  })
  .catch((e) => {
    console.log(`Not all mongo db of pr ${pr} deleted: ` + e);
  })
  .finally(() => {
    console.log('finally block');
    process.exit(0);
  });
