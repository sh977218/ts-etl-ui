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
