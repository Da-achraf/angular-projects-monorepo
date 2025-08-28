import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/base-dialog.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';

@Component({
  selector: 'ba-reject-idea-dialog',
  standalone: true,
  template: `
    <ba-base-dialog (cancel)="cancel()">
      <div class="flex w-full flex-col items-center gap-y-3 p-4">
        <span class="rounded-full bg-red-100 p-3">
          <span class="rounded-full bg-red-200 p-2">
            <i class="fa-solid fa-circle-exclamation text-red-400"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold"
          >You're about to reject the idea with id {{ data.ideaId }}</span
        >
        <span class="text-[1em]"
          >Are you sure you want to reject this idea?
        </span>

        <textarea
          [(ngModel)]="rejectionReason"
          placeholder="Enter reason for rejection"
          class="min-h-[80px] w-full resize-none rounded border border-gray-300 p-2"></textarea>

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
  imports: [BaButtonComponent, BaseDialogComponent, FormsModule],
})
export class RejectIdeaDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RejectIdeaDialogComponent>);
  protected readonly data = inject<{ ideaId: number }>(MAT_DIALOG_DATA);

  rejectionReason: string = '';

  confirm() {
    this.dialogRef.close({
      type: 'confirm',
      reason: this.rejectionReason.trim(),
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
