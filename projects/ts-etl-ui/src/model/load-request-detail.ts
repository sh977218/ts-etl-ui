import { ApiResponseService, ApiResponseStatus } from './api-response';

export type LoadRequestRecord = {
  opRequestSeq: number;
  codeSystemName: string;
  requestSubject: string;
  sourceFilePath: string;
  requestType: string;
  requestTime: Date;
  requester: string;
  requesterUsername: string;
  creationTime: Date;
  requestStatus: string;
  loadNumber: string;
  loadStatus: string;
  loadStartTime: Date;
  loadEndTime: Date;
  loadRequestMessageList: [LoadRequestMessage]
}

export type LoadRequestMessage = {
  'messageType': string,
  'tag': string,
  'message': string,
  'creationTime': string
}

export type LoadComponent = {
  'componentName': string,
  'componentStatus': string,
  'componentStartTime': string,
  'componentEndTime': string,
  'error': number
  'warning': number
  'info': number
}

export type LoadComponentMessage = {
  'componentName': string,
  'messageGroup': string,
  'messageType': string,
  'messageTag': string,
  'message': string,
  'creationTime': string
}

export type LoadRequestDetail = {
  'loadRequestRecord': LoadRequestRecord,
  'loadComponentList': [LoadComponent]
  'loadComponentMessageList': [LoadComponentMessage],
}

export type LoadRequestDetailResponseResult = {
  data: LoadRequestDetail
}

export type LoadRequestDetailResponse = {
  result: LoadRequestDetailResponseResult;
  service: ApiResponseService;
  status: ApiResponseStatus;
}