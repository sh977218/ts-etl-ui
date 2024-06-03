export type VersionQAsApiResponse={
    total_count:number,
    items:VersionQA[]
  }

export type VersionQAActivityHistory = {
  tag: string,
  createdBy: string,
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
      activityHistory: VersionQAActivityHistory[]
}

export type VersionQAReviewModalData = {
  tag: string,
  username: string
}

