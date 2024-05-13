export type LoadRequestActivitiesApiResponse = {
  total_count: number,
  items: LoadRequestActivity[]
}

export type LoadRequestActivity = {
  "requestId": number;
  "componentName": string;
  "startTime": string;
  "endTime": string;
  "duration": string;
  "status": string;
  "messageType": string;
  "message": string;
  "creationTime": string;
}
