export type LoadRequestMessagesApiResponse = {
  total_count: number,
  items: LoadRequestMessage[]
}

export type LoadRequestMessage = {
  "componentName": string;
  "messageGroup": string;
  "messageType": string;
  "tag": string;
  "message": string;
  "creationTime": Date;
}
