import { SearchPayloadPagination, SearchPayloadSortCriteria } from './search';

export type LoadVersionsApiResponse = {
  total_count: number,
  items: LoadVersion[]
}

export type Message = {
  message: string;
  creationTime: Date;
  tag: string;
  messageType: string;
}

export type LoadComponent = {
  componentName: string;
  status: string;
  startTime: Date;
  endTime: Date;
  errors: Message[];
  warnings: Message[];
  infos: Message[];
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

export type Verification = {
  rules: Rule[]
}

export type Rule = {
  'name': string,
  'description': string,
  'dataAvailable': string,
  'messages': RuleMessage[]
}

export type RuleUI = {
  'name': string,
  'description': string,
  'dataAvailable': string,
  'messagesGroupCount': { numOfError: number, numOfWarning: number, numOfInfo: number },
  messages: RuleMessage[]
}

export enum MessageGroup {
  ERROR = 'Error',
  WARNING = 'Warning',
  INFO = 'Info',
}

export type RuleMessage = {
  'messageGroup': MessageGroup,
  'messageType': string,
  'tag': string,
  'message': string,
  'creationTime': Date
}

export type RuleMessageUI = RuleMessage & {
  'name': string
}

export type Validation = {
  rules: Rule[]
}

export type Summary = {
  'totalRules': number,
  'rulesWithData': number,
  'messagesGroupCount': { numOfError: number, numOfWarning: number, numOfInfo: number }
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
  hashtags: string[]
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
  loadStartTime: Date;
  loadEndTime: Date;
  loadElapsedTime: Date;
  loadVersionActivities: LoadVersionActivity[];
  obsoleteId: string;
  versionNumber: string;
  language: string;
  country: string;
  notes: string[];
  publishedDate: Date;
  requestTime: Date;
  loadSummary: LoadSummary;
  verification: Verification
  validation: Validation
}

type LoadVersionPayloadSearchColumns = {
  requestId: string;
  codeSystemName: string;
  requester: string;
  versionStatus: string;
  loadNumber: string;
  loadStartTime: string;
  loadEndTime: string;
  requestStartTime: string;
  requestEndTime: string;
}


export type LoadVersionPayload = {
  pagination: SearchPayloadPagination,
  searchColumns: LoadVersionPayloadSearchColumns,
  sortCriteria: SearchPayloadSortCriteria,
}

export class LoadVersionSearchCriteria {
  requestId = undefined;
  codeSystemName = '';
  requester = undefined;
  version = undefined;
  versionStatus = '';
  loadNumber = undefined;
  requestStartTime = undefined;
  requestEndTime = undefined;
  loadStartTime = undefined;
  loadEndTime = undefined;

  constructor(qp: LoadVersionSearchCriteria) {
    this.requestId = qp.requestId;
    this.codeSystemName = qp.codeSystemName || '';
    this.requester = qp.requester;
    this.version = qp.version;
    this.versionStatus = qp.versionStatus || '';
    this.loadNumber = qp.loadNumber;
    this.requestStartTime = qp.requestStartTime;
    this.requestEndTime = qp.requestEndTime;
    this.loadStartTime = qp.loadStartTime;
    this.loadEndTime = qp.loadEndTime;
  }
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
  requestStartTime: string;
  requestEndTime: string;
  loadStartTime: string;
  loadEndTime: string;

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
    loadStartTime,
    loadEndTime,
    requestStartTime,
    requestEndTime,
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
      requestStartTime: requestStartTime || '',
      requestEndTime: requestEndTime || '',
      loadStartTime: loadStartTime || '',
      loadEndTime: loadEndTime || '',
    },
    sortCriteria: {
      sortBy: sortBy || 'requestId',
      sortDirection: sortDirection || 'asc',
    },

  } as LoadVersionPayload;
};

