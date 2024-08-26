import { ApiResponseResultPagination, ApiResponseService, ApiResponseStatus } from './api-response';

export interface Property {
  value: string;
}

// API response
type PropertyResponseResult = {
  data: Property[],
  hasPagination: boolean
  pagination: ApiResponseResultPagination
}

export type PropertyResponse = {
  result: PropertyResponseResult;
  service: ApiResponseService;
  status: ApiResponseStatus;
}