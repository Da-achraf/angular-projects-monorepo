import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'ba-dropdown',
  template: `
    <div class="relative w-full bg-gray-100 rounded-lg shadow">
      <select
        class="w-full cursor-pointer rounded-lg border py-3 px-4 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-200"
        [ngModel]="value"
        (ngModelChange)="onChange($event)"
        (blur)="onTouched()"
      >
        <option [ngValue]="null" disabled>{{ placeholder }}</option>
        <ng-content></ng-content>
      </select>
      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600"
      >
        <i class="fa-solid fa-chevron-down"></i>
      </div>
    </div>
  `,
  styles: [
    `
      select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }

      option {
        @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-primary-100;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaDropdownComponent),
      multi: true,
    },
  ],
  imports: [FormsModule],
})
export class BaDropdownComponent implements ControlValueAccessor {
  @Input() placeholder = 'Select Option'; // Placeholder text

  value: any = null; // Track the selected value
  onChange: (value: any) => void = () => {}; // Callback for value changes
  onTouched: () => void = () => {}; // Callback for touch events

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }
}
