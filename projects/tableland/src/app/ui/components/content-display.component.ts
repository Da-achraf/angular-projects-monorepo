import { Component, input } from '@angular/core';
import { SanitizeHtmlPipe } from '../pipes/sanitize-html.pipe';

@Component({
  selector: 'ba-content-display',
  template: `
    <div
      class="exclude-other-styles shadow rounded-md border-2 transition duration-500 border-gray-300 bg-white py-3 px-4 hover:shadow-md hover:border-primary-200 active:ring-1 active:ring-primary-200"
      [innerHTML]="content() | sanitize"
    ></div>
  `,
  imports: [SanitizeHtmlPipe],
})
export class ContentDisplayComponent {
  content = input.required<string>();
}
