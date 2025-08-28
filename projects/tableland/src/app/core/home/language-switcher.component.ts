import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '@ba/core/data-access';
import {
    SelectButtonModule,
    SelectButtonOptionClickEvent,
} from 'primeng/selectbutton';

@Component({
  selector: 'ba-language-switcher',
  template: `
    <p-selectbutton
      [options]="stateOptions"
      [(ngModel)]="defaultLang"
      optionLabel="label"
      optionValue="value"
      aria-labelledby="basic"
      (onOptionClick)="onLangChanged($event)" />
  `,
  imports: [SelectButtonModule, FormsModule],
})
export class LanguageSwitcherComponent {
  protected translationService = inject(TranslationService);

  stateOptions: any[] = [
    { label: 'En', value: 'en', title: 'English' },
    { label: 'Ar', value: 'ar', title: 'Arabic' },
  ];

  defaultLang!: 'ar' | 'en';

  onLangChanged(event: SelectButtonOptionClickEvent) {
    const selectedLang: 'ar' | 'en' = event.option.value;
    this.translationService.setLanguage(selectedLang);
  }

  ngOnInit() {
    this.defaultLang = this.translationService.selectedLanguage() as
      | 'en'
      | 'ar';
  }
}
