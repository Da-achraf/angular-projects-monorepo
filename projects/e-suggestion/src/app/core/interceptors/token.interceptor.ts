import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TOKEN_NAME } from '../api/api.model';
import { inject } from '@angular/core';
import { LocalStorageService } from '../auth/data-access/services/local-storage.service';

export function tokenInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const localStorage = inject(LocalStorageService);
  const token = localStorage.getItem(TOKEN_NAME);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
}
