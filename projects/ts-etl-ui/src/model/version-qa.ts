export type VersionQAsApiResponse = {
  total_count: number,
  items: VersionQA[]
}

export type VersionQAActivity = {
  sequence: number;
  action: string
  updatedTime: Date
  notes: QAActivityNote[]
}

export type QAActivityNote = {
  tag: string,
  createdBy: string,
  createdTime: Date,
  availableDate: Date,
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
  availableDate: Date
  requester: string;
  versionQaActivities: VersionQAActivity[]
}