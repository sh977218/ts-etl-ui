import { SearchPayloadPagination, SearchPayloadSortCriteria } from './search';

export type LoadRequestActivity = {
  componentName: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  messageType: string;
  message: string;
  creationTime: string;
}

export type LoadRequestMessage = {
  componentName: string;
  messageGroup: string;
  messageType: string;
  tag: string;
  message: string;
  creationTime: Date;
}

export type LoadRequest = {
  requestId: string;
  codeSystemName: string;
  requestSubject: string;
  sourceFilePath: string;
  requestType: string;
  requestTime: Date;
  requester: string;
  creationTime: Date;
  requestStatus: string;
  numberOfMessages: number;
  loadNumber: string;
  loadStatus: string;
  loadStartTime: Date;
  loadEndTime: Date;
  duration: Date;
  loadRequestActivities: LoadRequestActivity[]
  loadRequestMessages: LoadRequestMessage[]
}

// API request payload
type LoadRequestPayloadSearchFilters = {
  filterRequestTime: string;
  filterRequester: string;
}

type LoadRequestPayloadSearchColumns = {
  requestId: string;
  codeSystemName: string;
  requestSubject: string;
  requestStatus: string;
  requestType: string;
  requestStartTime: string;
  requestEndTime: string;
  requester: string;
  creationStartTime: string;
  creationEndTime: string;
}

export type LoadRequestPayload = {
  pagination: SearchPayloadPagination,
  searchFilters: LoadRequestPayloadSearchFilters,
  searchColumns: LoadRequestPayloadSearchColumns,
  sortCriteria: SearchPayloadSortCriteria,
}

export class LoadRequestSearchCriteria {
  requestId = undefined;
  codeSystemName = '';
  requestSubject = undefined;
  requestStatus = '';
  requestType = '';
  requestStartTime = undefined;
  requestEndTime = undefined;
  requester = undefined;
  creationStartTime = undefined;
  creationEndTime = undefined;
  filterRequestTime = undefined;
  filterRequester = undefined;

  constructor(qp: LoadRequestSearchCriteria) {
    this.requestId = qp.requestId;
    this.codeSystemName = qp.codeSystemName || '';
    this.requestSubject = qp.requestSubject;
    this.requestStatus = qp.requestStatus || '';
    this.requestType = qp.requestType || '';
    this.requestStartTime = qp.requestStartTime;
    this.requestEndTime = qp.requestEndTime;
    this.requester = qp.requester;
    this.creationStartTime = qp.creationStartTime;
    this.creationEndTime = qp.creationEndTime;
    this.filterRequestTime = qp.filterRequestTime;
    this.filterRequester = qp.filterRequester;
  }
}

export type FlatLoadRequestPayload = {
  // pagination
  pageNum: number,
  pageSize: number,

  // searchColumns
  requestId: string,
  codeSystemName: string,
  requestSubject: string,
  requestStatus: string,
  requestType: string,
  requestStartTime: string,
  requestEndTime: string,
  requester: string,
  creationStartTime: string,
  creationEndTime: string,

  // searchFilters
  filterRequestTime: string,
  filterRequester: string,

  // sortCriteria
  sortBy: string,
  sortDirection: string,
}

export const generateLoadRequestPayload = (flatLoadRequestPayload: FlatLoadRequestPayload): LoadRequestPayload => {
  const {
    pageNum,
    pageSize,
    requestId,
    codeSystemName,
    requestSubject,
    requestStatus,
    requestType,
    requestStartTime,
    requestEndTime,
    requester,
    creationStartTime,
    creationEndTime,
    sortBy,
    sortDirection,
    filterRequestTime,
    filterRequester,
  } = flatLoadRequestPayload;

  return {
    pagination: {
      pageNum: pageNum || 1,
      pageSize: pageSize || 10,
    },
    searchFilters: {
      filterRequestTime: filterRequestTime || '',
      filterRequester: filterRequester || '',
    },
    searchColumns: {
      requestId: requestId || '',
      codeSystemName: codeSystemName || '',
      requestSubject: requestSubject || '',
      requestStatus: requestStatus || '',
      requestType: requestType || '',
      requestStartTime: requestStartTime || '',
      requestEndTime: requestEndTime || '',
      requester: requester || '',
      creationStartTime: creationStartTime || '',
      creationEndTime: creationEndTime || '',
    },
    sortCriteria: {
      sortBy: sortBy || 'requestId',
      sortDirection: sortDirection || 'asc',
    },

  } as LoadRequestPayload;
};

// API response
type LoadRequestsResponseResultPagination = {
  totalCount: number;
  page: number;
  pageSize: number;
}

type LoadRequestsResponseResult = {
  data: LoadRequest[],
  hasPagination: boolean
  pagination: LoadRequestsResponseResultPagination
}

type LoadRequestsResponseService = {
  url: string;
  accessTime: Date;
  duration: number;
}

type LoadRequestsResponseStatus = {
  success: boolean
}

export type LoadRequestsResponse = {
  result: LoadRequestsResponseResult;
  service: LoadRequestsResponseService;
  status: LoadRequestsResponseStatus;
}

