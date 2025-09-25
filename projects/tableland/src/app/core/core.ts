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
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslationConfig, TranslationService } from '@ba/core/data-access';
import {
  popperVariation,
  provideTippyConfig,
  provideTippyLoader,
  tooltipVariation,
} from '@ngneat/helipopper/config';
import { BarChart, FunnelChart, PieChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import * as enTranslations from '../../../public/i18n/en.json';
import { tokenInterceptor } from './interceptors/token.interceptor';

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

const VibrantOrangePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#FFF8F2', // Lightest - Creamy white with orange tint
      100: '#FFEDD5', // Very light peach
      200: '#FFD7AA', // Light apricot
      300: '#FFC080', // Soft orange
      400: '#FFA94D', // Warm orange
      500: '#FF6B00', // VIBRANT ORANGE (main color)
      600: '#E05D00', // Rich orange
      700: '#C24F00', // Deep orange
      800: '#A34100', // Dark burnt orange
      900: '#853300', // Chocolate orange
      950: '#662600', // Almost brown
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

    TranslationService,
    {
      provide: TranslationConfig,
      useValue: {
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        rtlLanguages: ['ar'],
        storageKey: 'tableland-lang',

        // Pre-load translations
        initialTranslations: {
          en: enTranslations,
        },
      },
    },

    provideNativeDateAdapter(),

    providePrimeNG({
      ripple: true,

      theme: {
        options: {
          darkModeSelector: '.my-app-dark',
        },
        preset: VibrantOrangePreset, // Set the custom preset here
      },
    }),
    provideEchartsCore({ echarts }),

    provideTippyLoader(() => import('tippy.js')),
    provideTippyConfig({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: tooltipVariation,
        popper: popperVariation,
      },
    }),
  ];
}
