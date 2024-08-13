export type CodeSystemsApiResponse = {
  items: CodeSystem[]
}

export type CodeSystem = {
  'codeSystemName': string;
  'title': string;
  'versions': CodeSystemVersion[];
  sourceInformation: CodeSystemSourceInformation
}

export type CodeSystemVersion = {
  'versionName': string,
  'status': string,
  'publishedDate': Date;
  'effectiveDate': Date;
  'availableDate': Date;
  'codes': CodeSystemCode[]
}

export type CodeSystemCode = {
  'code': number,
  'name': string
  'status': string
  'termType': string
  'isActive': string
}
export type CodeSystemSourceInformation = CodeSystemSourceInformation1 & CodeSystemSourceInformation2;

export type CodeSystemSourceInformation1 = {
  'Version ID': string;
  'Source Family': string;
  'Source Name': string;
  'Normalized Source': string;
  'Official Name': string;
  'Stripped Source': string;
  'Version': string;
  'Low Source': string;
  'Restriction Level': string;
  'NLM Contact': string;
  'Acquisition Contact': string;
  'URL': string;
  'Language': string;
  'Citation': string;
  'License Info': string;
  'Character Set': string;
  'Context Type': string;
  'Rel Directionality Flag': string;
}
export type CodeSystemSourceInformation2 = {
  'Content Contact': string[];
  'License Contact': string[];
}

export type VersionStatusSummary = {
  'Code System Name': string,
  'Version': string,
  'Load Number': string,
  'Total number of codes': number,
  'Number of active codes': number,
  'Number of inactive codes': number,
  'Total number of terms': number,
  'Total number of properties': number,
  'Total number of remap codes': number,
  'Total number of hierarchies': number,
  'Total number of relationships': number,
  'Total number of attributes': number,
}

export type VersionStatus = {
  summary: VersionStatusSummary
}
export type VersionStatusMeta = {
  codeSystemName: string,
  currentVersion: number,
  priorVersion: number,
}