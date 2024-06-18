export type LoadRequestsApiResponse = {
  total_count: number,
  items: LoadRequest[]
}

export type LoadRequestActivity = {
  'componentName': string;
  'startTime': string;
  'endTime': string;
  'duration': string;
  'status': string;
  'messageType': string;
  'message': string;
  'creationTime': string;
}

export type LoadRequestMessage = {
  'componentName': string;
  'messageGroup': string;
  'messageType': string;
  'tag': string;
  'message': string;
  'creationTime': Date;
}

export type LoadRequest = {
  requestId: string;
  codeSystemName: string;
  requestSubject: string;
  sourceFilePath: string;
  type: string;
  requestTime: Date;
  requester: string;
  creationTime: Date;
  requestStatus: string;
  numberOfMessages: number;
  loadNumber: number;
  loadStatus: string;
  loadTime: Date;
  duration: Date;
  loadRequestActivities: LoadRequestActivity[]
  loadRequestMessages: LoadRequestMessage[]
}
