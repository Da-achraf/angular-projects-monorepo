import { inject, Injectable } from '@angular/core';
import { API_REQUEST_DELAY, ApiResponse, Response } from '@ba/core/data-access';
import { ApiService } from '@ba/core/http-client';
import { delay, map, Observable, tap } from 'rxjs';
import { RegisterUser, UpdateUser, User } from '../auth.model';
import { QueryParamType } from '../../../api/api.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  readonly #apiService = inject(ApiService);
  readonly #requestDelay = inject(API_REQUEST_DELAY);

  load(
    page: number,
    pageSize: number,
    queryParams?: QueryParamType
  ): Observable<Response<User>> {
    const params = {
      page: page.toString(),
      items_per_page: pageSize.toString(),
      ...queryParams,
    };
    return this.#apiService.get('/users', { queryParams: params }).pipe(
      map(resp => resp as Response<User>),
      map(resp => ({ ...resp, content: resp.content as User[] })),
      map(resp => ({
        ...resp,
        content: resp.content.map(u => ({
          ...u,
          created_at: new Date(u.created_at),
        })),
      })),
      tap(console.log),
      delay(this.#requestDelay)
    );
  }

  loadAll(): Observable<ApiResponse<User[]>> {
    return this.#apiService.get<User[]>(`/users/all`);
  }

  save(userBody: RegisterUser) {
    return this.#apiService.post<User, RegisterUser>(`/users`, userBody);
  }

  loadOne(id: number): Observable<ApiResponse<User>> {
    return this.#apiService
      .get('/users', { pathParams: { id } })
      .pipe(map(resp => resp as ApiResponse<User>));
  }

  deleteOne(id: number): Observable<ApiResponse<User>> {
    return this.#apiService
      .delete(`/users/${id}`)
      .pipe(map(resp => resp as ApiResponse<User>));
  }

  delete(ids: number[]): Observable<ApiResponse<User>> {
    return this.#apiService
      .batchDelete('/users', ids)
      .pipe(map(resp => resp as ApiResponse<User>));
  }

  update(userBody: Partial<UpdateUser>) {
    return this.#apiService
      .put<UpdateUser>(`/users/${userBody.id}`, userBody)
      .pipe(map(resp => resp as ApiResponse<User>));
  }
}
