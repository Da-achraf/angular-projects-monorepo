import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/base-dialog.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';

@Component({
  selector: 'ba-initiate-assignment-dialog',
  template: `
    <ba-base-dialog (cancel)="cancel()">
      <div class="w-full flex flex-col gap-y-3 p-4 items-center ">
        <span class="p-3 rounded-full bg-cyan-100">
          <span class="p-2 bg-cyan-200 rounded-full">
            <i class="fa-solid fa-circle-exclamation text-cyan-500"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold"
          >You're about to initiate an assignment</span
        >
        <span class="text-[1em]"
          >Are you sure you want to initiate this assignment?
        </span>

        <div class="w-full flex items-center justify-center gap-x-3 py-3">
          <ba-button
            class="flex-1"
            label="Cancel"
            icon="fa-xmark"
            buttonClass="text-gray-500 border border-gray-400 bg-neutral-50 hover:bg-neutral-100"
            (onClick)="cancel()"
          />
          <ba-button
            class="flex-1"
            label="Confirm"
            icon="fa-check-double"
            buttonClass="bg-green-400 text-gray-50 hover:bg-green-500"
            (onClick)="confirm()"
          />
        </div>
      </div>
    </ba-base-dialog>
  `,
  imports: [BaButtonComponent, BaseDialogComponent],
})
export class InitiateAssignmentDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<InitiateAssignmentDialogComponent>
  );

  confirm() {
    this.dialogRef.close({ type: 'confirm' });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
