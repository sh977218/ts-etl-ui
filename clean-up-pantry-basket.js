import fetch from "node-fetch";

export async function deleteAllCollections() {
  const PANTRY_ID = process.env.PANTRY_ID;
  let pr = '' || process.env.PR;
  return Promise.all(
    [`users`, `loadRequests`, `loadRequestActivities`, `versionQAs`]
      .map(collType => `${collType}${pr}`)
      .map(collType => {
        return fetch(
          `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${collType}`,
          {
            method: "DELETE"
          })
      })
  );
}