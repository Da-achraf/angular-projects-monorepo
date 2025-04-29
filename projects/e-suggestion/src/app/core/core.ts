import { TitleCasePipe } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideEnvironmentInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  Routes,
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { API_URL, WS_URL } from '@ba/core/http-client';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { provideEchartsCore } from 'ngx-echarts';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../../environments/environment';
import { errorInterceptor } from './interceptors/error.interceptor';
// import echarts core
import * as echarts from 'echarts/core';
// import necessary echarts components
import { BarChart, FunnelChart, PieChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { provideNativeDateAdapter } from '@angular/material/core';
import { tokenInterceptor } from './interceptors/token.interceptor';
import { TRANSLATION_CONFIG } from 'projects/core/src';
import { LocalStorageService } from './auth/data-access/services/local-storage.service';

echarts.use([
  BarChart,
  RadarChart,
  FunnelChart,
  PieChart,
  GridComponent,
  CanvasRenderer,
  TooltipComponent,
  LegendComponent,
]);

export interface CoreOptions {
  routes: Routes;
}

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#F5F7FB', // Lightest - Almost white with a hint of blue
      100: '#E1E7F3', // Very light blue
      200: '#C3CFE7', // Light blue
      300: '#A4B7DB', // Medium-light blue
      400: '#869FCF', // Less light blue
      500: '#3C5D9E', // Main color - Your specified blue
      600: '#354F87', // Slightly darker
      700: '#2E4270', // Darker blue
      800: '#263459', // Very dark blue
      900: '#1E2942', // Nearly black blue
      950: '#161D2B', // Deepest blue, almost black
    },
  },
});

export function provideCore({ routes }: CoreOptions) {
  return [
    provideExperimentalZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor, tokenInterceptor])),
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
      withComponentInputBinding(),
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })
    ),
    provideEnvironmentInitializer(() => {}),
    {
      provide: API_URL,
      useValue: environment.apiUrl,
    },

    {
      provide: WS_URL,
      useValue: environment.wsUrl,
    },

    MessageService,
    TitleCasePipe,

    provideNativeDateAdapter(),

    providePrimeNG({
      ripple: true,

      theme: {
        options: {
          darkModeSelector: '.my-app-dark',
        },
        preset: MyPreset,
      },
    }),
    provideEchartsCore({ echarts }),

    {
      provide: TRANSLATION_CONFIG,
      useValue: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'ar'],
        rtlLanguages: ['ar'],
        rtlFontClass: 'font-arabic',
        storageKey: 'e-suggestion-lang',
        // Provide your storage service implementation
        storageService: {
          provide: 'StorageService',
          useExisting: LocalStorageService,
        },
        // Pre-load translations
        initialTranslations: {
          en: enTranslations,
          ar: arTranslations,
        },
      },
    },
  ];
}
