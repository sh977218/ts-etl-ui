import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';

const moment = _rollupMoment || _moment;

import { SearchPayloadPagination, SearchPayloadSortCriteria } from './search';

export type Message = {
  message: string;
  creationTime: Date;
  tag: string;
  messageType: string;
}

export type LoadRequestActivity = {
  componentName: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  infos: Message[];
  warnings: Message[];
  errors: Message[];
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
  opRequestSeq: string;
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
  filterRequestTime?: string;
  filterRequester?: string;
}

type LoadRequestPayloadSearchColumns = {
  opRequestSeq?: string;
  codeSystemName?: string;
  requestSubject?: string;
  requestStatus?: string;
  requestType?: string;
  requestTimeFrom?: Moment;
  requestTimeTo?: Moment;
  requester?: string;
  creationTimeFrom?: Date;
  creationTimeTo?: Date;
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
      codeSystemName: codeSystemName || '',
      requestSubject: requestSubject || '',
      requestStatus: requestStatus || '',
      requestType: requestType || '',
      requestTimeFrom: requestTimeFrom ? moment(requestTimeFrom) : undefined,
      requestTimeTo: requestTimeTo ? moment(requestTimeTo) : undefined,
      requester: requester || '',
      creationTimeFrom: creationTimeFrom ? new Date(creationTimeFrom) : undefined,
      creationTimeTo: creationTimeTo ? new Date(creationTimeTo) : undefined,
    },
    sortCriteria: {
      sortBy: sortBy || 'opRequestSeq',
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

