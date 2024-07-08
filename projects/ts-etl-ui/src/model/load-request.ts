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

export const flattenLoadRequestPayload = (loadRequestPayload: LoadRequestPayload): FlatLoadRequestPayload => {
  const { pagination, searchFilters, searchColumns, sortCriteria } = loadRequestPayload;
  const { pageNum, pageSize } = pagination;
  const { filterRequestTime, filterRequester } = searchFilters;
  const {
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
  } = searchColumns;
  const { sortBy, sortDirection } = sortCriteria;
  return {
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
  } as FlatLoadRequestPayload;
};

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

