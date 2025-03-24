import { InjectionToken } from '@angular/core';

export type ApiResponse<T> = {
  /**
   * This is the standard response structure
   *
   */
  message?: string;
  data?: T | T[] | null; // Data can be T, T[], or null
};

export type Response<T> = {
  /**
   * This is a custon response structure reserved
   * for entities retrieval (get all)
   *
   */
  message?: string;
  content?: T[] | T;
  page: number;
  total: number;
};

export const API_REQUEST_DELAY = new InjectionToken<number>(
  'API_REQUEST_DELAY',
  {
    factory: () => 0,
  }
);
