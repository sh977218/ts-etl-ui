import { ApiResponseResultPagination, ApiResponseService, ApiResponseStatus } from './api-response';

export interface Property {
  value: string;
}

export interface CreateRequestCodeSystemListProperty {
  codeSystemName: string;
}

// API response
type PropertyResponseResult = {
  data: Property[] & CreateRequestCodeSystemListProperty[] & string[],
  hasPagination: boolean
  pagination: ApiResponseResultPagination
}

export type PropertyResponse = {
  result: PropertyResponseResult;
  service: ApiResponseService;
  status: ApiResponseStatus;
}