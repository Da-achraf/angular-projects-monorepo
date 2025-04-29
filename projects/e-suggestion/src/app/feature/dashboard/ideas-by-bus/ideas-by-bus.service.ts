import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@ba/core/http-client';
import { Observable, of } from 'rxjs';
import { QueryParamType } from '../../../core/api/api.model';
import { BuIdeaCount } from './ideas-by-bu.model';

@Injectable()
export class IdeasByBuService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  ideasCount(params: QueryParamType): Observable<BuIdeaCount[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] != null) {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    // return of([
    //   {
    //     plantId: 1,
    //     plantName: 'TAC1',
    //     count: 4,
    //   },
    // ]);
    return this.http.get<BuIdeaCount[]>(`${this.baseUrl}/kpis/ideas-by-bus`, {
      params: httpParams,
    });
  }
}
