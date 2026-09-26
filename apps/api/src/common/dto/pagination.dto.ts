export class PaginationQueryDto {
  page?: string;
  limit?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
