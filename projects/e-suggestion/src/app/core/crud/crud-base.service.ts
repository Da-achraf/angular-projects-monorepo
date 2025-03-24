import { inject } from '@angular/core';
import { ApiResponse, Response } from '@ba/core/data-access';
import { ApiService } from '@ba/core/http-client';
import { map, Observable } from 'rxjs';

export class CrudBaseService<
  R extends { id: number },
  C,
  U extends { id: number }
> {
  protected readonly apiService = inject(ApiService);

  constructor(protected readonly url: string) {}

  load(page: number, pageSize: number): Observable<Response<R>> {
    return this.apiService
      .get(this.url, { queryParams: { page, items_per_page: pageSize } })
      .pipe(map((resp) => resp as Response<R>));
  }

  save(userBody: C) {
    return this.apiService
      .post<R, C>(`${this.url}`, userBody)
      .pipe(map((resp) => resp as ApiResponse<R>));
  }

  loadAll(): Observable<ApiResponse<R[]>> {
    return this.apiService.get<R[]>(`${this.url}/all`);
  }

  loadOne(id: number): Observable<ApiResponse<R>> {
    return this.apiService
      .get(this.url, { pathParams: { id } })
      .pipe(map((resp) => resp as ApiResponse<R>));
  }

  deleteOne(id: number): Observable<ApiResponse<R>> {
    return this.apiService
      .delete(`${this.url}/${id}`)
      .pipe(map((resp) => resp as ApiResponse<R>));
  }

  delete(ids: number[]): Observable<ApiResponse<R>> {
    return this.apiService
      .batchDelete(this.url, ids)
      .pipe(map((resp) => resp as ApiResponse<R>));
  }

  update(userBody: Partial<U>) {
    return this.apiService
      .put<U>(`${this.url}/${userBody.id}`, userBody)
      .pipe(map((resp) => resp as ApiResponse<R>));
  }
}
