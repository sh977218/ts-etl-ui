export type ApiResponseService = {
  url: string;
  accessTime: Date;
  duration: number;
}

export type ApiResponseStatus = {
  success: boolean
}

export type ApiResponseResultPagination = {
  totalCount: number;
  page: number;
  pageSize: number;
}
