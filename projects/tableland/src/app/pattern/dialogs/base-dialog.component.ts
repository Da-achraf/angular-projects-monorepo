import { Component, output } from '@angular/core';

@Component({
  selector: 'ba-base-dialog',
  template: `
    <div class="w-full flex flex-col gap-y-3 p-4 items-center relative">
      <button
        class="absolute right-2 top-2 fa-solid p-1 fa-xmark text-xl text-gray-400 transition-all duration-200 ring-gray-400 hover:text-gray-500"
        (click)="cancel.emit()"
      ></button>
      <div class="w-full">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class BaseDialogComponent {
  cancel = output<void>();
}
