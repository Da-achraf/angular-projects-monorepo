import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitize',
})
export class SanitizeHtmlPipe implements PipeTransform {
  sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    // Mark the HTML content as safe
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
