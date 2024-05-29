import {pantryClient} from "./server/db.js";

export async function deleteAllCollections() {
  let pr = '' || process.env.PR;
  return Promise.all(
    [`users`, `loadRequests`, `loadRequestActivities`, `versionQAs`]
      .map(collType => `${collType}${pr}`)
      .map(collType => pantryClient.basket.delete('ToDoList'))
  );
}

deleteAllCollections()
  .then(() => {
    console.log('All pantry baskets delete')
  })
  .catch((e) => {
    console.log('Not all pantry baskets delete: ' + e)
  })
  .finally(() => {
    console.log('finally block')
  })
