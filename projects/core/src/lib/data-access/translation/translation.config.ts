import { InjectionToken } from '@angular/core';

/**
 * Configuration options for the translation service
 */
export class TranslationConfig {
  /** Default language to use */
  defaultLanguage: string = 'en';

  /** Supported languages */
  supportedLanguages: string[] = ['en'];

  /** Languages that should be displayed RTL */
  rtlLanguages: string[] = [];

  /** Storage key for saving language preference */
  storageKey: string = 'app-language';

  /** Optional CSS class for RTL languages */
  rtlFontClass?: string;

  /** Initial translations to load */
  initialTranslations?: Record<string, Record<string, string>>;
}

/**
 * Injection token for TranslationConfig
 */
export const TRANSLATION_CONFIG = new InjectionToken<TranslationConfig>(
  'TRANSLATION_CONFIG'
);
