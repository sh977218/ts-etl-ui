import { resetMongoCollection } from './server/db.js';

resetMongoCollection()
  .then(() => {
    console.log(`Reset all mongo db of pr ${pr}`);
  })
  .catch((e) => {
    console.log(`Not all mongo db of pr ${pr} reset: ` + e);
  })
  .finally(() => {
    console.log('finally block');
    process.exit(0);
  });