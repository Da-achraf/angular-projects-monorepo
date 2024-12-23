import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiService } from '@ba/core/http-client';
import { map, Observable, of } from 'rxjs';
import { LoginUser, RegisterUser, User } from '../auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiService = inject(ApiService);

  register(credentials: RegisterUser): Observable<User & {token: string}> {
    return this.apiService.post<User, RegisterUser>('/auth/register', credentials ).pipe(
        map(resp => resp.data as User & {token: string})
    );
  }

  login(credentials: LoginUser): Observable<User & {token: string}> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', credentials.username);
    body.set('password', credentials.password);
    body.set('scope', '');
    body.set('client_id', '');
    body.set('client_secret', '');

    return this.apiService.post<User, string>('/auth/login', body.toString(), { headers } ).pipe(
        map(resp => resp.data as User & {token: string})
    );
  }

  logout() {
    return of(null)
    throw new Error("Logout not implemented");
  }
}