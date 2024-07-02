export type VersionQAsApiResponse = {
  total_count: number,
  items: VersionQA[]
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

export type VersionQAActivity = {
  id?: string;
  activity: string
  updatedTime: Date
  availableDate: Date,
  nbNotes?: number;
  notes: QAActivityNote[]
}

export type QAActivityNote = {
  createdBy: string,
  createdTime: Date,
  notes: string
}

export type VersionQA = {
  requestId: string
  loadNumber: number
  codeSystemName: string
  sourceFilePath: string
  requestSubject: string
  versionStatus: string
  version: string
  effectiveDate: Date
  requester: string;
  loadTime: Date;
  duration: string;
  versionQaActivities: VersionQAActivity[];
  obsoleteId: string;
  versionNumber: string;
  language: string;
  country: string;
  notes: string[];
  publishedDate: Date;
  requestTime: Date;
  loadSummary: LoadSummary;
}
