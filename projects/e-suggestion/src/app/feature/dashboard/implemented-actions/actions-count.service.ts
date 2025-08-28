import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@ba/core/http-client';
import { map, Observable, of } from 'rxjs';
import { QueryParamType } from '../../../core/api/api.model';
import { ActionsCount } from './actions-count.model';

@Injectable()
export class ActionsCountService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  actionsCount(params: QueryParamType): Observable<ActionsCount> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] != null) {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    return this.http
      .get<{ data: ActionsCount }>(`${this.baseUrl}/kpis/actions-count`, {
        params: httpParams,
      })
      .pipe(map(r => r.data));
  }
}
