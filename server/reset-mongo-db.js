import { resetMongoCollection } from './db.js';

resetMongoCollection()
  .then(() => console.log('Reset DB successfully from reset-mongo-db.js'))
  .catch((reason) => {
    console.log('Reset DB failed from reset-mongo-db.js' + ` ${reason}`);
    process.exit(1);
  })
  .finally(() => {
    console.log('Reset DB final callback from reset-mongo-db.js');
    process.exit(0);
  });
