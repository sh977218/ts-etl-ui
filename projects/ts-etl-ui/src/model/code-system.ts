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

export type CodeSystemSourceInformation = {
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
  'Content Contact': string;
  'License Contact': string;
}

