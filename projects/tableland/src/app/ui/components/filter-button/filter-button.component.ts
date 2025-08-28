import { NgClass } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { TranslatePipe, TranslationService } from '@ba/core/data-access';

@Component({
  selector: 'ba-filter-button',
  template: `
    <button
      [dir]="translationService.dir()"
      type="button"
      (click)="onClick.emit($event)"
      class="relative mr-auto inline-flex cursor-pointer items-center rounded-full border border-gray-200 bg-white px-5 py-2 text-center text-sm font-medium text-gray-800 hover:bg-gray-100 focus:shadow sm:mr-0">
      <span
        class="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-400"></span>
      <i class="fa-solid fa-filter mr-2 text-gray-500" [ngClass]="{'ml-2 mr-0': translationService.dir() === 'rtl'}"></i>
      {{ 'filter' | translate }}
    </button>
  `,
  imports: [TranslatePipe, NgClass]
})
export class FilterButtonComponent {
  onClick = output<Event>();

  translationService = inject(TranslationService)
}
