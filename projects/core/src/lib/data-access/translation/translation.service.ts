import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../localstorage.service';
import { TranslationConfig } from './translation.config';

@Injectable()
export class TranslationService {
  private document = inject(DOCUMENT);
  private config = inject(TranslationConfig);
  private localStorage = inject(LocalStorageService);

  private language = signal<string>(this.config.defaultLanguage);
  private _translations = signal<Record<string, Record<string, string>>>({});

  dir = computed(() =>
    this.config.rtlLanguages.includes(this.language()) ? 'rtl' : 'ltr'
  );
  selectedLanguage = this.language.asReadonly();

  constructor() {
    // Initialize with translations if provided in config
    if (this.config.initialTranslations) {
      this._translations.set(this.config.initialTranslations);
    }

    // Load saved language from storage if available
    const savedLang = this.localStorage.getItem(this.config.storageKey);
    if (savedLang && this.isValidLanguage(savedLang)) {
      this.setLanguage(savedLang);
    }
  }

  /**
   * Set active language
   */
  setLanguage(lang: string) {
    if (!this.isValidLanguage(lang)) {
      console.warn(`Language ${lang} is not available in current translations`);
      return;
    }

    // Handle RTL font class if configured
    if (this.config.rtlFontClass) {
      if (this.config.rtlLanguages.includes(lang)) {
        this.document.body.classList.add(this.config.rtlFontClass);
      } else {
        this.document.body.classList.remove(this.config.rtlFontClass);
      }
    }

    this.language.set(lang);

    // Save to storage if configured
    this.localStorage.saveItem(this.config.storageKey, lang);
  }

  /**
   * Translate a key
   */
  translate(key: string): string {
    const translations = this._translations();
    const currentLang = this.language();

    if (!translations[currentLang]) {
      return key;
    }

    return (
      translations[currentLang][key.toLowerCase()] || this.toTitleCase(key)
    );
  }

  /**
   * Add or update translations for a language
   */
  addTranslations(lang: string, translations: Record<string, string>) {
    const current = this._translations();
    this._translations.set({
      ...current,
      [lang]: {
        ...(current[lang] || {}),
        ...translations,
      },
    });
  }

  /**
   * Check if language is available in translations
   */
  private isValidLanguage(lang: string): boolean {
    return this.config.supportedLanguages.includes(lang);
  }

  /**
   * transform a string to title case.
   * @example:
   *    input => 'achraf boukir'
   *    returns => 'Achraf Boukir'
   */
  private toTitleCase(str: any) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word: any) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}
