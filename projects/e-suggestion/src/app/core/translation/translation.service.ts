import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import * as ar from '../../../../public/i18n/ar.json';
import * as en from '../../../../public/i18n/en.json';
import { LocalStorageService } from '../auth/data-access/services/local-storage.service';

const LANG_TOKEN = 'e-suggestion-lang';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private document = inject(DOCUMENT);
  private localStorage = inject(LocalStorageService);

  private language = signal<'en' | 'ar'>('en');

  private translations = computed(() => {
    return this.language() === 'en' ? en : ar;
  });

  dir = computed(() => (this.language() === 'ar' ? 'rtl' : 'ltr'));

  selectedLanguage = this.language.asReadonly();

  constructor() {
    const saveLangInLocalStorage = this.localStorage.getItem(LANG_TOKEN);

    if (!saveLangInLocalStorage) return;

    this.setLanguage(saveLangInLocalStorage);
  }

  setLanguage(lang: 'en' | 'ar') {
    if (lang === 'ar') {
      this.document.body.classList.add('font-arabic');
      // this.document.body.dir = 'rtl';
    } else {
      this.document.body.classList.remove('font-arabic');
      // this.document.body.dir = 'ltr';
    }

    this.language.set(lang);
    this.saveLangToLocalStorage(lang);
  }

  translate(key: string): string {
    const translations = this.translations() as Record<string, string>;
    return translations[key.toLowerCase()] || this.toTitleCase(key);
  }

  saveLangToLocalStorage(lang: 'en' | 'ar') {
    this.localStorage.saveItem(LANG_TOKEN, lang);
  }

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
