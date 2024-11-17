import { createMongoCollections, resetMongoCollection } from './db.js';

createMongoCollections()
  .then(() => {
    console.log('Create DB successfully from create-mongo-db.js');
    process.exit(0);
  })
  .catch((reason) => {
    console.log('Create DB failed from create-mongo-db.js' + ` ${reason}`);
    process.exit(1);
  })
  .finally(() => {
    console.log('Create DB final callback from create-mongo-db.js');
    process.exit(0);
  });
