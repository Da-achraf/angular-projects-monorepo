// import {
//   Component,
//   computed,
//   effect,
//   input,
//   output,
//   untracked,
// } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { DatePickerModule } from 'primeng/datepicker';
// import { TranslatePipe } from '@ba/core/data-access';
// import { TitleCasePipe } from '@angular/common';
// import { User } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.model';

// @Component({
//   selector: 'ba-due-date',
//   template: `
//     <div class="flex flex-col gap-y-2">
//       <div class="flex items-center gap-x-2">
//         <span class="text-sm font-semibold uppercase tracking-wide text-primary"
//           >{{ label() | translate }}
//           <span class="text-xs text-orange-400"
//             >[Set by {{ setByFullName() | titlecase }}]</span
//           ></span
//         >
//         <span class="h-[.4px] flex-1 bg-gray-300"></span>
//       </div>
//       <p-datepicker
//         [placeholder]="'select-due-date' | translate"
//         [disabled]="disabled()"
//         styleClass="w-full"
//         [(ngModel)]="date"
//         [iconDisplay]="'input'"
//         appendTo="body"
//         [showIcon]="true"
//         inputId="icondisplay"
//         hourFormat="24"
//         [showTime]="true"
//         [showButtonBar]="true"
//         (onClearClick)="dueDateChange.emit(date)"
//         (onSelect)="dueDateChange.emit(date)" />
//     </div>
//   `,
//   imports: [DatePickerModule, FormsModule, TranslatePipe, TitleCasePipe],
// })
// export class DueDateComponent {
//   label = input('');
//   setBy = input<User | undefined>(undefined);

//   setByFullName = computed(() => {
//     if (this.setBy())
//       return `${this.setBy()?.first_name ?? ''} ${this.setBy()?.last_name ?? ''}`;
//     else return 'N/A';
//   });

//   dueDate = input<Date | undefined>(undefined);
//   disabled = input(false);

//   protected date: Date | undefined = undefined;

//   dueDateChange = output<Date | undefined>();

//   dueDateEffect = effect(() => {
//     const dueDate = this.dueDate();
//     if (!dueDate) return;

//     untracked(() => (this.date = new Date(dueDate)));
//   });
// }

import {
  Component,
  computed,
  effect,
  input,
  output,
  untracked,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslatePipe } from '@ba/core/data-access';
import { TitleCasePipe } from '@angular/common';
import { User } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.model';
import {
  SimpleDateValidator,
  getSimpleDateValidationMessage,
} from './simple-date.validator';

@Component({
  selector: 'ba-due-date',
  template: `
    <div class="flex flex-col gap-y-2">
      <div class="flex items-center gap-x-2">
        <span class="text-sm font-semibold uppercase tracking-wide text-primary"
          >{{ label() | translate }}
          <span class="text-xs text-orange-400"
            >[<span class="mr-1 text-primary italic">{{ complementaryLabel() }}</span>
            <span class="text-primary">Set by</span>
            {{ setByFullName() | titlecase }}]</span
          ></span
        >
        <span class="h-[.4px] flex-1 bg-gray-300"></span>
      </div>
      <p-datepicker
        [placeholder]="'select-due-date' | translate"
        styleClass="w-full"
        [formControl]="dateControl"
        [iconDisplay]="'input'"
        appendTo="body"
        [showIcon]="true"
        inputId="icondisplay"
        hourFormat="24"
        [showTime]="true"
        [showButtonBar]="true"
        (onClearClick)="onDateChange()"
        (onSelect)="onDateChange()" />

      <!-- Validation Error Messages -->
      @if (dateControl.invalid && dateControl.touched) {
        <div class="text-sm text-red-500">
          {{ getValidationMessage() }}
        </div>
      }
    </div>
  `,
  imports: [
    DatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    TitleCasePipe,
  ],
})
export class DueDateComponent {
  label = input('');
  complementaryLabel = input<string | null>(null);

  setBy = input<User | undefined>(undefined);

  setByFullName = computed(() => {
    if (this.setBy())
      return `${this.setBy()?.first_name ?? ''} ${this.setBy()?.last_name ?? ''}`;
    else return 'N/A';
  });

  dueDate = input<Date | undefined>(undefined);
  disabled = input(false);

  // Simple validation inputs - only two options
  notBeforeNow = input<boolean>(false); // Should the date not be before now?
  afterDate = input<Date | undefined>(undefined); // Should the date be after this date?

  protected dateControl = new FormControl<Date | undefined>(undefined);

  dueDateChange = output<Date | undefined>();
  validationChange = output<boolean>();

  constructor() {
    // Update validators when validation inputs change
    effect(() => {
      this.updateValidators();
    });

    // Sync with input dueDate
    effect(() => {
      const dueDate = this.dueDate();
      if (!dueDate) return;

      untracked(() =>
        this.dateControl.setValue(new Date(dueDate), { emitEvent: false })
      );
    });

    effect(() => {
      const disabled = this.disabled();

      if (disabled) this.dateControl.disable();
      else this.dateControl.enable();
    });

    // // Emit validation status changes
    // effect(() => {
    //   const isValid = this.dateControl.valid;
    //   untracked(() => this.validationChange.emit(isValid));
    // });

    // Emit initial validation status
    effect(() => {
      const isValid = this.dateControl.valid;
      untracked(() => this.validationChange.emit(isValid));
    });

    // 🔁 Emit on validation changes from user interaction
    this.dateControl.statusChanges.subscribe(() => {
      this.validationChange.emit(this.dateControl.valid);
    });
  }

  private updateValidators(): void {
    const validators: ValidatorFn[] = [];

    // Case 1: Date should not be before now
    if (this.notBeforeNow()) {
      validators.push(SimpleDateValidator.notBeforeNow());
    }

    // Case 2: Date should be after another given date
    if (this.afterDate()) {
      validators.push(SimpleDateValidator.afterDate(this.afterDate()!));
    }

    untracked(() => {
      this.dateControl.setValidators(validators);
      this.dateControl.updateValueAndValidity();
    });
  }

  protected onDateChange(): void {
    const date = this.dateControl.value as Date | undefined;
    this.dueDateChange.emit(date);
    this.validationChange.emit(this.dateControl.valid);
  }

  protected getValidationMessage(): string {
    if (this.dateControl.errors) {
      return getSimpleDateValidationMessage(this.dateControl.errors);
    }
    return '';
  }

  // Public method to check validation status
  public isValid(): boolean {
    return this.dateControl.valid;
  }

  // Public method to get validation errors
  public getValidationErrors() {
    return this.dateControl.errors;
  }
}
