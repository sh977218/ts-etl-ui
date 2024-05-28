import fetch from "node-fetch";

export async function deleteCollection(collType) {
  const PANTRY_ID = process.env.PANTRY_ID;
  let pr = '' || process.env.PR;
  return fetch(
    `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${collType}${pr}`,
    {
      method: "DELETE"
    }
  );
}

export async function deleteAllCollections() {
  let pr = '' || process.env.PR;
  return Promise.all(
    [`users`, `loadRequests`, `loadRequestActivities`, `versionQAs`]
    .map(collType => this.deleteCollection(collType))
  );
}

(deleteAllCollections)()
