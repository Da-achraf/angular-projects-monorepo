import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { API_URL } from '@ba/core/http-client';

import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    {
      provide: API_URL,
      useValue: environment.apiUrl
    },
  ]
};
