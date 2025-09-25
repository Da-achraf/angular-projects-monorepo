import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@ba/core/http-client';
import { lastValueFrom, catchError, throwError } from 'rxjs';

export type CacheResponse<T = any> = {
  success?: boolean;
  data?: T;
  value?: T;
  key?: string;
  path?: string;
  message?: string;
  deleted?: string;
  merged?: boolean;
};

export type HealthCheckResponse = {
  status: string;
  redis: string;
  message?: string;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL);
  private readonly baseUrl = `${this.url}/cache`;

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    return await lastValueFrom(
      this.http
        .get<HealthCheckResponse>(`${this.baseUrl}/health`)
        .pipe(catchError(this.handleError))
    );
  }

  // Set entire cache object
  async set<T>(
    key: string,
    value: T,
    expire: number | null = null
  ): Promise<CacheResponse> {
    let params = new HttpParams();
    if (expire !== null) {
      params = params.set('expire', expire.toString());
    }

    return await lastValueFrom(
      this.http
        .post<CacheResponse>(`${this.baseUrl}/${key}`, value, { params })
        .pipe(catchError(this.handleError))
    );
  }

  // Get entire cache object
  async get<T>(key: string, asJson: boolean = true): Promise<T> {
    const params = new HttpParams().set('as_json', asJson.toString());

    const response = await lastValueFrom(
      this.http
        .get<T>(`${this.baseUrl}/${key}`, { params })
        .pipe(catchError(this.handleError))
    );

    return this.extractValue<T>(response, asJson);
  }

  // Get nested value
  async getNested<T>(
    key: string,
    path: string,
    asJson: boolean = true
  ): Promise<T> {
    const params = new HttpParams().set('as_json', asJson.toString());

    const response = await lastValueFrom(
      this.http
        .get<T>(`${this.baseUrl}/${key}/${path}`, { params })
        .pipe(catchError(this.handleError))
    );

    return this.extractValue<T>(response, asJson);
  }

  // Delete entire cache object
  async delete(key: string): Promise<CacheResponse> {
    return await lastValueFrom(
      this.http
        .delete<CacheResponse>(`${this.baseUrl}/${key}`)
        .pipe(catchError(this.handleError))
    );
  }

  // Set nested value
  async setNested<T>(
    key: string,
    path: string,
    value: T,
    expire: number | null = null
  ): Promise<CacheResponse> {
    let params = new HttpParams();
    if (expire !== null) {
      params = params.set('expire', expire.toString());
    }

    return await lastValueFrom(
      this.http
        .post<CacheResponse>(`${this.baseUrl}/${key}/${path}`, value, {
          params,
        })
        .pipe(catchError(this.handleError))
    );
  }

  // Update nested value with merge option
  async updateNested<T>(
    key: string,
    path: string,
    value: T,
    expire: number | null = null,
    merge: boolean = true
  ): Promise<CacheResponse> {
    let params = new HttpParams().set('merge', merge.toString());
    if (expire !== null) {
      params = params.set('expire', expire.toString());
    }

    return await lastValueFrom(
      this.http
        .patch<CacheResponse>(`${this.baseUrl}/${key}/${path}`, value, {
          params,
        })
        .pipe(catchError(this.handleError))
    );
  }

  // Delete nested value
  async deleteNested(key: string, path: string): Promise<CacheResponse> {
    return await lastValueFrom(
      this.http
        .delete<CacheResponse>(`${this.baseUrl}/${key}/${path}`)
        .pipe(catchError(this.handleError))
    );
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      await this.get(key, false);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  // Check if nested path exists
  async nestedExists(key: string, path: string): Promise<boolean> {
    try {
      await this.getNested(key, path, false);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  // Set machine status value
  async setMachineStatus(
    key: string,
    path: string,
    value: string,
    areaId: number,
    expire: number | null = null
  ): Promise<CacheResponse> {
    let params = new HttpParams();
    if (expire !== null) {
      params = params.set('expire', expire.toString());
    }

    return await lastValueFrom(
      this.http
        .post<CacheResponse>(
          `${this.baseUrl}/machine-status/${key}/${path}?area_id=${areaId}`,
          value,
          {
            params,
          }
        )
        .pipe(catchError(this.handleError))
    );
  }

  // Helper method to build nested paths
  static buildPath(...segments: string[]): string {
    return segments.join('.');
  }

  // Helper method to extract value from response
  private extractValue<T>(response: any, asJson: boolean): T {
    if (
      asJson &&
      response &&
      typeof response === 'object' &&
      'value' in response
    ) {
      return response.value;
    }
    return response;
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.detail) {
        errorMessage = error.error.detail;
      }
    }

    console.error('Cache API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
