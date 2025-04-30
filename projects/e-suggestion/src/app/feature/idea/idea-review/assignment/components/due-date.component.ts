import { Component, effect, input, output, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslatePipe } from '@ba/core/data-access';

@Component({
  selector: 'ba-due-date',
  template: `
    <div class="flex flex-col gap-y-2">
      <div class="flex items-center gap-x-2">
        <span
          class="text-sm font-semibold uppercase tracking-wide text-primary"
          >{{ 'due-date' | translate }}</span
        >
        <span class="h-[.4px] flex-1 bg-gray-300"></span>
      </div>
      <p-datepicker
        [placeholder]="'select-due-date' | translate"
        [disabled]="disabled()"
        styleClass="w-full"
        [(ngModel)]="date"
        [iconDisplay]="'input'"
        appendTo="body"
        [showIcon]="true"
        inputId="icondisplay"
        hourFormat="24"
        [showTime]="true"
        [showButtonBar]="true"
        (onClearClick)="dueDateChange.emit(date)"
        (onSelect)="dueDateChange.emit(date)" />
    </div>
  `,
  imports: [DatePickerModule, FormsModule, TranslatePipe],
})
export class DueDateComponent {
  dueDate = input<Date | undefined>(undefined);
  disabled = input(false);

  protected date: Date | undefined = undefined;

  dueDateChange = output<Date | undefined>();

  dueDateEffect = effect(() => {
    const dueDate = this.dueDate();
    if (!dueDate) return;

    untracked(() => (this.date = new Date(dueDate)));
  });
}
