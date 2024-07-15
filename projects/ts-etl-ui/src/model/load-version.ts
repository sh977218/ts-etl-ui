import { SearchPayloadPagination, SearchPayloadSortCriteria } from '../model/search';

export type LoadVersionsApiResponse = {
  total_count: number,
  items: LoadVersion[]
}

export type LoadComponent = {
  componentName: string;
  status: string;
  startTime: Date;
  duration: number;
  errors: string[];
  warnings: string[];
  infos: string[];
}

export type LoadRule = {
  type: string;
  rule: string;
  error: string;
  warning: string;
  info: string;
}

export type LoadSummary = {
  components: LoadComponent[];
  qaRules: LoadRule[];
}

export type LoadVersionActivity = {
  id?: Date;
  activity: string
  updatedTime: Date
  availableDate: Date,
  nbNotes?: number;
  notes: LoadVersionActivityNote[]
}

export type LoadVersionActivityNote = {
  createdBy: string,
  createdTime: Date,
  notes: string,
  hashtags: string
}

export type LoadVersion = {
  requestId: string
  loadNumber: string
  codeSystemName: string
  sourceFilePath: string
  requestSubject: string
  versionStatus: string
  version: string
  effectiveDate: Date
  requester: string;
  loadTime: Date;
  duration: string;
  loadVersionActivities: LoadVersionActivity[];
  obsoleteId: string;
  versionNumber: string;
  language: string;
  country: string;
  notes: string[];
  publishedDate: Date;
  requestTime: Date;
  loadSummary: LoadSummary;
}

type LoadVersionPayloadSearchColumns = {
  requestId: string;
  codeSystemName: string;
  requester: string;
  versionStatus: string;
  loadNumber: string;
}


export type LoadVersionPayload = {
  pagination: SearchPayloadPagination,
  searchColumns: LoadVersionPayloadSearchColumns,
  sortCriteria: SearchPayloadSortCriteria,
}

export type FlatLoadVersionPayload = {
  // pagination
  pageNum: number,
  pageSize: number,

  // searchColumns
  requestId: string,
  codeSystemName: string,
  requester: string,
  version: string,
  versionStatus: string,
  loadNumber: string,

  // sortCriteria
  sortBy: string,
  sortDirection: string,
}

export const generateLoadVersionPayload = (flatLoadVersionPayload: FlatLoadVersionPayload): LoadVersionPayload => {
  const {
    pageNum,
    pageSize,
    requestId,
    codeSystemName,
    version,
    versionStatus,
    loadNumber,
    requester,
    sortBy,
    sortDirection,
  } = flatLoadVersionPayload;

  return {
    pagination: {
      pageNum: pageNum || 1,
      pageSize: pageSize || 10,
    },
    searchColumns: {
      requestId: requestId || '',
      codeSystemName: codeSystemName || '',
      requester: requester || '',
      version: version || '',
      versionStatus: versionStatus || '',
      loadNumber: loadNumber || '',
    },
    sortCriteria: {
      sortBy: sortBy || 'requestId',
      sortDirection: sortDirection || 'asc',
    },

  } as LoadVersionPayload;
};

