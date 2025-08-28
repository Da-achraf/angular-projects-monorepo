import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'ba-prime-dropdown',
  template: `
    <!-- <p-select
      [options]="cities"
      [(ngModel)]="selectedCity"
      [checkmark]="true"
      optionLabel="name"
      [showClear]="true"
      placeholder="Select a City"
      class="w-full md:w-56"
    /> -->
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
      useExisting: forwardRef(() => BaPrimeDropdownComponent),
      multi: true,
    },
  ],
  imports: [FormsModule, SelectModule],
})
export class BaPrimeDropdownComponent implements ControlValueAccessor {
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
