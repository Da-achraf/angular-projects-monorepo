import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QueryParamType } from '../../../core/api/api.model';
import { API_URL } from '@ba/core/http-client';
import { Observable } from 'rxjs';

type ScoreCardType = {
  total: number;
  implemented: number;
  pending: number;
  rejected: number;
};

@Injectable()
export class ScoreCardService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  ideasCount(params: QueryParamType): Observable<ScoreCardType> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] != null) {
        httpParams = httpParams.append(key, params[key]);
      }
    });
    return this.http.get<ScoreCardType>(`${this.baseUrl}/kpis/ideas-count`, {
      params: httpParams,
    });
  }
}
