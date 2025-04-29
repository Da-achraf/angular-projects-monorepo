import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  SelectButtonModule,
  SelectButtonOptionClickEvent,
} from 'primeng/selectbutton';
import { TranslationService } from '../translation/translation.service';
import { TranslatePipe } from '../translation/translate.pipe';
import { LogoComponent } from '../../ui/components/logo.component';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    SelectButtonModule,
    FormsModule,
    TranslatePipe,
    LogoComponent,
  ],
})
export class HomeComponent {
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
    this.defaultLang = this.translationService.selectedLanguage();
  }
}
