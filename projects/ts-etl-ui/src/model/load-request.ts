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
  loadNumber: number;
  loadStatus: string;
  loadTime: Date;
  duration: Date;
  loadRequestActivities: LoadRequestActivity[]
  loadRequestMessages: LoadRequestMessage[]
}

// API request payload
type LoadRequestPayloadPagination = {
  pageNum: number;
  pageSize: number;
}

type LoadRequestPayloadSearchFilters = {
  requestTime: string;
  requester: string;
}

type LoadRequestPayloadSearchColumns = {
  requestId: string;
  codeSystemName: string;
  requestSubject: string;
  requestStatus: string;
  requestStartTime: string;
  requestEndTime: string;
  requestType: string;
}

type LoadRequestPayloadSortCriteria = {
  sortBy: string;
  sortDirection: string;
}

export type LoadRequestPayload = {
  pagination: LoadRequestPayloadPagination,
  searchFilters: LoadRequestPayloadSearchFilters,
  searchColumns: LoadRequestPayloadSearchColumns,
  sortCriteria: LoadRequestPayloadSortCriteria,
}

export type FlatLoadRequestPayload = {
  // pagination
  pageNum: number,
  pageSize: number,

  // searchColumns
  codeSystemName: string,
  requestEndTime: string,
  requestId: string,
  requestStartTime: string,
  requestStatus: string,
  requestSubject: string,
  requestType: string,

  // searchFilters
  requestTime: string,
  requester: string,

  // sortCriteria
  sortBy: string,
  sortDirection: string,
}

export const flattenLoadRequestPayload = (loadRequestPayload: LoadRequestPayload): FlatLoadRequestPayload => {
  const { pagination, searchFilters, searchColumns, sortCriteria } = loadRequestPayload;
  const { pageNum, pageSize } = pagination;
  const { requestTime, requester } = searchFilters;
  const {
    codeSystemName,
    requestEndTime,
    requestId,
    requestStartTime,
    requestStatus,
    requestSubject,
  } = searchColumns;
  const { sortBy, sortDirection } = sortCriteria;
  return {
    pageNum,
    pageSize,
    codeSystemName,
    requestEndTime,
    requestId,
    requestStartTime,
    requestStatus,
    requestSubject,
    requestTime,
    requester,
    sortBy,
    sortDirection,
  } as FlatLoadRequestPayload;
};

export const generateLoadRequestPayload = (flatLoadRequestPayload: FlatLoadRequestPayload): LoadRequestPayload => {
  const {
    pageNum,
    pageSize,
    codeSystemName,
    requestEndTime,
    requestId,
    requestStartTime,
    requestStatus,
    requestSubject,
    requestType,
    requestTime,
    requester,
    sortBy,
    sortDirection,
  } = flatLoadRequestPayload;

  return {
    pagination: {
      pageNum: pageNum || 1,
      pageSize: pageSize || 10,
    },
    searchFilters: {
      requestTime: requestTime || '',
      requester: requester || '',
    },
    searchColumns: {
      codeSystemName: codeSystemName || '',
      requestEndTime: requestEndTime || '',
      requestId: requestId || '',
      requestStartTime: requestStartTime || '',
      requestStatus: requestStatus || '',
      requestSubject: requestSubject || '',
      // this is not implemented in NLM api
      requestType: requestType || '',
    },
    sortCriteria: {
      sortBy: sortBy || 'requestSubject',
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

