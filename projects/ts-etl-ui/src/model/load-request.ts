import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment;

import {
  ApiResponseResultPagination,
  ApiResponseService,
  ApiResponseStatus,
} from './api-response';
import { SearchPayloadPagination, SearchPayloadSortCriteria } from './search';

export type LoadRequestMessage = {
  componentName: string;
  messageGroup: string;
  messageType: string;
  tag: string;
  message: string;
  creationTime: Date;
}

export type LoadRequest = {
  opRequestSeq: number;
  codeSystemName: string;
  requestSubject: string;
  sourceFilePath: string;
  requestType: string;
  requestTime: Date;
  requester: string;
  creationTime: Date;
  requestStatus: string;
  // This should be removed later. It doesn't belong here and should be calculated from LV
  numberOfMessages: number;
  loadNumber: string;
  loadStatus: string;
  loadStartTime: Date;
  loadEndTime: Date;
  duration: Date;
  loadRequestMessages: LoadRequestMessage[]
}

// API request payload
type LoadRequestPayloadSearchFilters = {
  filterRequestTime?: string;
  filterRequester?: string;
}

type LoadRequestPayloadSearchColumns = {
  opRequestSeq?: string;
  codeSystemName?: string[];
  requestSubject?: string;
  requestStatus?: string[];
  requestType?: string[];
  requestTimeFrom?: Moment;
  requestTimeTo?: Moment;
  requester?: string;
  creationTimeFrom?: Moment;
  creationTimeTo?: Moment;
}

export type LoadRequestPayload = {
  pagination: SearchPayloadPagination,
  searchFilters: LoadRequestPayloadSearchFilters,
  searchColumns: LoadRequestPayloadSearchColumns,
  sortCriteria: SearchPayloadSortCriteria,
}

export type FlatLoadRequestPayload =
  SearchPayloadPagination
  & LoadRequestPayloadSearchFilters
  & LoadRequestPayloadSearchColumns
  & SearchPayloadSortCriteria;

export const generateLoadRequestPayload = (flatLoadRequestPayload: FlatLoadRequestPayload): LoadRequestPayload => {
  const {
    pageNum,
    pageSize,
    opRequestSeq,
    codeSystemName,
    requestSubject,
    requestStatus,
    requestType,
    requestTimeFrom,
    requestTimeTo,
    requester,
    creationTimeFrom,
    creationTimeTo,
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
      opRequestSeq: opRequestSeq || '',
      codeSystemName: codeSystemName,
      requestSubject: requestSubject || '',
      requestStatus: requestStatus || [],
      requestType: requestType || [],
      requestTimeFrom: requestTimeFrom ? moment(requestTimeFrom) : undefined,
      requestTimeTo: requestTimeTo ? moment(requestTimeTo) : undefined,
      requester: requester || '',
      creationTimeFrom: creationTimeFrom ? moment(creationTimeFrom) : undefined,
      creationTimeTo: creationTimeTo ? moment(creationTimeTo) : undefined,
    },
    sortCriteria: {
      sortBy: sortBy || 'creationTime',
      sortDirection: sortDirection || 'desc',
    },

  } as LoadRequestPayload;
};

// API response
type LoadRequestsResponseResult = {
  data: LoadRequest[],
  hasPagination: boolean
  pagination: ApiResponseResultPagination
}

export type LoadRequestsResponse = {
  result: LoadRequestsResponseResult;
  service: ApiResponseService;
  status: ApiResponseStatus;
}

export type CreateLoadRequestsResponse = {
  result: { data: number, hasPagination: boolean };
  service: ApiResponseService;
  status: ApiResponseStatus;
}
