import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LocalStorageService } from './local-storage.service';
import { TOKEN_NAME } from '../../../api/api.model';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly localStorage = inject(LocalStorageService);

  setToken(token: string): boolean {
    return this.localStorage.saveItem(TOKEN_NAME, token);
  }

  getToken() {
    const token = this.localStorage.getItem(TOKEN_NAME);
    if (token) return token;
  }

  removeToken() {
    return this.localStorage.removeItem(TOKEN_NAME);
  }

  getDecodedToken() {
    const token = this.localStorage.getItem(TOKEN_NAME);
    if (!token) return;

    return this.decodeToken(token);
  }

  private decodeToken(token: string) {
    return jwtDecode(token);
  }

  private getTokenExpirationDate(token: string): Date | null {
    const decoded: any = this.decodeToken(token);
    if (decoded.exp === undefined) return null;
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  // function to validate access and refresh tokens
  isTokenValid(token: string) {
    if (!token) return false;

    const expirationDate = this.getTokenExpirationDate(token);
    if (expirationDate) {
      const now = new Date();
      return expirationDate >= now;
    }
    return false;
  }
}
