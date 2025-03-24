import {
  AfterContentInit,
  Component,
  contentChild,
  ElementRef,
  input
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputErrorsComponent } from '@ba/core/forms';

@Component({
  selector: 'ba-input',
  template: `
    <div class="flex flex-col">
      <div
        class="relative text-sm flex overflow-hidden shadow rounded-md border-2 transition focus-within:border-primary-200"
      >
        <ng-content select="input"></ng-content>
        <ng-content select="i"></ng-content>
      </div>
      <ba-input-errors [control]="control()" />
    </div>
  `,
  styles: [
    `
      :host ::ng-deep input {
        @apply w-full flex-shrink appearance-none border-gray-300 bg-white py-3 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none;
      }
    `,
  ],
  imports: [InputErrorsComponent],
})
export class BaInputComponent implements AfterContentInit {
  control = input.required<AbstractControl>();
  icon = contentChild<ElementRef>('icon');

  inputElement = contentChild<ElementRef<HTMLInputElement>>('input');

  ngAfterContentInit(): void {
    const inputElement = this.inputElement();
    const iconElement = this.icon();

    if (!iconElement || !inputElement) return;

    // Add click event listener to the icon
    iconElement.nativeElement.addEventListener('click', (ev: MouseEvent) => {
      ev.stopPropagation();

      // Toggle the input type between 'text' and 'password'
      const inputType = inputElement.nativeElement.type;
      if (inputType === 'text') {
        inputElement.nativeElement.type = 'password';
        iconElement.nativeElement.classList.remove('fa-eye-slash');
        iconElement.nativeElement.classList.add('fa-eye');
      } else {
        inputElement.nativeElement.type = 'text';
        iconElement.nativeElement.classList.remove('fa-eye');
        iconElement.nativeElement.classList.add('fa-eye-slash');
      }
    });
  }
}
