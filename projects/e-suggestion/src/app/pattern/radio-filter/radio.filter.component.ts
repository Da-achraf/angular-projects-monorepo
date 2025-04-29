import { Component, effect, input, output, signal } from '@angular/core';
import { FilterOptionClassPipe } from './option-class.pipe';
import { FilterOption } from './types';
import { TranslatePipe } from '../../core/translation/translate.pipe';

@Component({
  selector: 'ba-radio-filter',
  template: `
    <div
      class="flex select-none gap-x-1 overflow-hidden rounded-xl border-[1px] border-primary-100 text-xs font-semibold shadow shadow-primary-100">
      @for (option of options(); track $index) {
        <label
          [title]="(option.title ? option.title : '') | translate"
          class="radio flex flex-grow cursor-pointer items-center justify-center rounded-lg p-1">
          <input
            type="radio"
            [name]="uniqueName"
            [value]="option.value"
            [checked]="selectedOption() === option.value"
            (change)="onOptionChange(option.value)"
            class="peer hidden" />
          <span
            [class]="option.value | optionClass: selectedOption()"
            class="border-b border-transparent transition-all duration-300 hover:border-primary-100">
            {{ option.label | translate }}
          </span>
        </label>
      }
    </div>
  `,
  standalone: true,
  imports: [FilterOptionClassPipe, TranslatePipe],
})
export class RadioFilterComponent {
  options = input.required<FilterOption[]>();
  initialSelected = input<string>();

  optionSelected = output<string>();

  // Generate a unique name to prevent radio group conflicts
  protected uniqueName = `radio-filter-${Math.random()
    .toString(36)
    .substring(2)}`;

  // Use a signal for local state management
  protected readonly selectedOption = signal<string | undefined>(undefined);

  // Initialize the selected option when options change
  optionsEffect = effect(() => {
    const options = this.options();
    const initial = this.initialSelected();

    if (options.length > 0) {
      this.selectedOption.set(initial || options[0].value);
      this.optionSelected.emit(initial || options[0].value);
    }
  });

  onOptionChange(value: string): void {
    this.selectedOption.set(value);
    this.optionSelected.emit(value);
  }
}
