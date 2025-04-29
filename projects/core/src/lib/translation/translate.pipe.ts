import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  pure: false, // Allows automatic recalculation when the language changes
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: string, params?: Record<string, string>): string {
    let translation = this.translationService.translate(value);

    // Simple parameter replacement using {{param}} syntax
    if (params) {
      Object.keys(params).forEach(key => {
        translation = translation.replace(`{{${key}}}`, params[key]);
      });
    }

    return translation;
  }
}
