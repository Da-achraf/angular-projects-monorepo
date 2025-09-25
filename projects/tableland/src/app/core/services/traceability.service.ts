import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@ba/core/http-client';
import { catchError, lastValueFrom, throwError } from 'rxjs';

export type TraceabilityResponse<T = any> = {
  success?: boolean;
  data?: T;
  value?: T;
  key?: string;
  path?: string;
  message?: string;
  deleted?: string;
  merged?: boolean;
};

@Injectable({ providedIn: 'root' })
export class TraceabilityService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL);
  private readonly baseUrl = `${this.url}/traceability`;

  // Resume prod
  async resumeProd(machineName: string): Promise<TraceabilityResponse> {
    return await lastValueFrom(
      this.http
        .post<TraceabilityResponse>(
          `${this.baseUrl}/resume-prod/${machineName.toLowerCase()}`,
          {}
        )
        .pipe(catchError(this.handleError))
    );
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

    console.error('Traceability API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
