
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api-url.token';

// Define the standardized response interface with a generic type
export type ApiResponse<T> = {
  message?: string;
  data?: T | T[] | null; // Data can be T, T[], or null
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly api_url = inject(API_URL);

  // GET method with query and path parameters
  get<T>(
    url: string,
    queryParams: { [key: string]: any } = {},
    pathParams: { [key: string]: any } = {}
  ): Observable<ApiResponse<T>> {
    // Replace path parameters in the URL
    const finalUrl = this.replacePathParams(url, pathParams);

    // Convert query parameters to HttpParams
    let params = new HttpParams();
    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        params = params.set(key, queryParams[key]);
      }
    }

    return this.http.get<ApiResponse<T>>(`${this.api_url}${finalUrl}`, {
      headers: this.headers,
      params,
      withCredentials: true,
    });
  }

  // POST method
  post<T, D>(url: string, data?: D, options?: {[key: string]: any}): Observable<ApiResponse<T>> {
    let _options = options
    if (!_options) {
      _options = {
        headers: this.headers,
        withCredentials: true,
      }
    }
    return this.http.post<ApiResponse<T>>(`${this.api_url}${url}`, JSON.stringify(data), _options);
  }

  // PUT method
  put<T>(url: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.api_url}${url}`, JSON.stringify(data), {
      headers: this.headers,
      withCredentials: true,
    });
  }

  // DELETE method
  delete<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.api_url}${url}`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  // DELETE method [Patch delete]
  batchDelete<T>(url: string, ids: number[]): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.api_url}${url}`, {
      body: {ids},
      headers: this.headers,
      withCredentials: true,
    });
  }

  // Helper method to generate headers
  get headers(): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    return new HttpHeaders(headersConfig);
  }

  // Helper method to replace path parameters in the URL
  private replacePathParams(url: string, pathParams: { [key: string]: any }): string {
    let finalUrl = url;
    for (const key in pathParams) {
      if (pathParams.hasOwnProperty(key)) {
        finalUrl = finalUrl.replace(`:${key}`, encodeURIComponent(pathParams[key]));
      }
    }
    return finalUrl;
  }
}