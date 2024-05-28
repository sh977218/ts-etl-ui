import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

export async function getCollection(collType) {
  let resp = await fetch(`https://getpantry.cloud/apiv1/pantry/${process.env.PANTRY_ID}/basket/${collType}`);
  if (resp.ok) {
    return await resp.json();
  }
}

// It's possible that pantry suffers from performance issues or running out of credit.
// We can consider a cancellable timeout if too many saves is too much.
// We can also consider a merge instead of update all, but it might be even more expensive...
export async function saveCollection(collType, payload) {
  await fetch(`https://getpantry.cloud/apiv1/pantry/${process.env.PANTRY_ID}/basket/${collType}`, {
    method: 'PUT',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload)
  });
}
