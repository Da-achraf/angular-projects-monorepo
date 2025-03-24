import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/base-dialog.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';

interface ConfirmDialogData {
  header: string;
  body?: string;
}

@Component({
  selector: 'ba-confirm-assignment-dialog',
  template: `
    <ba-base-dialog (cancel)="cancel()">
      <div class="flex w-full flex-col items-center gap-y-3 p-4">
        <span class="rounded-full bg-cyan-200 p-3">
          <span class="rounded-full bg-cyan-300 p-2">
            <i class="fa-solid fa-circle-exclamation text-cyan-500"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold"
          >You're about to {{ data.header }}.</span
        >
        @if (data.body; as body) {
          <span class="text-[1em] font-medium">{{ body }} </span>
        }

        <span class="text-[1em]">Are you sure you want to continue? </span>

        <div class="flex w-full items-center justify-center gap-x-3 py-3">
          <ba-button
            class="flex-1"
            label="Cancel"
            icon="fa-xmark"
            buttonClass="text-gray-500 border border-gray-400 bg-neutral-50 hover:bg-neutral-100"
            (onClick)="cancel()" />
          <ba-button
            class="flex-1"
            label="Confirm"
            icon="fa-check-double"
            buttonClass="bg-green-400 text-gray-50 hover:bg-green-500"
            (onClick)="confirm()" />
        </div>
      </div>
    </ba-base-dialog>
  `,
  imports: [BaButtonComponent, BaseDialogComponent],
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  confirm() {
    this.dialogRef.close({ type: 'confirm' });
  }

  cancel() {
    this.dialogRef.close({ type: 'cancel' });
  }
}
