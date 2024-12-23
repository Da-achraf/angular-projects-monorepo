import { inject, Injectable } from '@angular/core';
import { ApiService } from '@ba/core/http-client';
import { map, Observable, of } from 'rxjs';
import { User } from '../../../core/auth/data-access/auth.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiService = inject(ApiService);

  load(page: number): Observable<{ content: { id: number; }[]; page: number; total: number; }> {
    return this.apiService.get('/users', { page }).pipe(
        map(resp => resp.data as {content: {id: number}[], page: number, total: number})
    )
  }

  update(user: User) {
    return this.apiService.put<User>(`/users/${user.id}`, user).pipe(
        map(resp => resp.data as User)
    )
  }
}