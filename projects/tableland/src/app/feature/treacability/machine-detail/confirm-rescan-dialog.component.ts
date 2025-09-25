import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/base-dialog.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';

@Component({
  selector: 'ba-confirm-rescan-dialog',
  template: `
    <ba-base-dialog (cancel)="cancel()">
      <div class="flex w-full flex-col items-center gap-y-3 p-4">
        <span class="rounded-full bg-cyan-100 p-3">
          <span class="rounded-full bg-cyan-200 p-2">
            <i class="fa-solid fa-circle-exclamation text-cyan-500"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold"
          >You're about to initiate a new PO & PN scan</span
        >
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
            label="Continue"
            icon="fa-check-double"
            buttonClass="bg-green-400 text-gray-50 hover:bg-green-500"
            (onClick)="confirm()" />
        </div>
      </div>
    </ba-base-dialog>
  `,
  imports: [BaButtonComponent, BaseDialogComponent],
})
export class ConfirmRescanDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<ConfirmRescanDialogComponent>
  );

  confirm() {
    this.dialogRef.close({ type: 'confirm' });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
