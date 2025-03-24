import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'cleanHtml',
  standalone: true,
})
export class CleanHtmlPipe implements PipeTransform {
  transform(value: string): string {
    
    // Replace &nbsp; with a regular space
    return value.replace(/&nbsp;/g, ' ');
  }
}
