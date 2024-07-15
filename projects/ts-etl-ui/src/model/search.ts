import { SortDirection } from '@angular/material/sort';

// API request payload
export type SearchPayloadPagination = {
  pageNum: number;
  pageSize: number;
}

export type SearchPayloadSortCriteria = {
  sortBy: string;
  sortDirection: SortDirection;
}
