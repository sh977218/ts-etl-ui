export type LoadRequestsApiResponse={
  total_count:number,
  items:LoadRequest[]
}

export type LoadRequest={
  requestId:string;
  codeSystemName:string;
  sourceFilePath:string;
  requestSubject:string;
  requestStatus:string;
  version:string;
  availableDate:Date;
  requester:string;
  requestTime:Date;
}
