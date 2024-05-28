export type VersionQAsApiResponse={
    total_count:number,
    items:VersionQA[]
  }
  
  export type VersionQA={
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
  }
  