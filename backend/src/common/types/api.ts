// src/common/types/api.ts
export type StandardApiResponse<T> = { data: T } | { error: { code: string; message: string } };

export type PaginatedAPIResponse<T> = {
  items: T[];
  total: number;
  group: number;
  groupSize: number;
};