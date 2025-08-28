import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@ba/core/http-client';
import { Observable } from 'rxjs';
import { QueryParamType } from '../../../core/api/api.model';
import { DepartmentIdeaCount } from './ideas-by-department.model';

@Injectable()
export class IdeasByDepartmentService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  ideasCount(params: QueryParamType): Observable<DepartmentIdeaCount[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] != null) {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    return this.http.get<DepartmentIdeaCount[]>(
      `${this.baseUrl}/kpis/ideas-by-departments`,
      {
        params: httpParams,
      }
    );
  }
}
