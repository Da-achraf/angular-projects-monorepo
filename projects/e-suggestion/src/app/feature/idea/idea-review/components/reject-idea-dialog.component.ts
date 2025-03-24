import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/base-dialog.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';


@Component({
  selector: 'ba-reject-idea-dialog',
  standalone: true,
  template: `
    <ba-base-dialog (cancel)="cancel()">
      <div class="w-full flex flex-col gap-y-3 p-4 items-center ">
        <span class="p-3 rounded-full bg-red-100">
          <span class="p-2 bg-red-200 rounded-full">
            <i class="fa-solid fa-circle-exclamation text-red-400"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold">You're about to reject the idea with id {{ data.ideaId }}</span>
        <span class="text-[1em]"
          >Are you sure you want to reject this idea?
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
export class RejectIdeaDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RejectIdeaDialogComponent>);
  protected readonly data = inject<{ideaId: number}>(MAT_DIALOG_DATA);

  confirm() {
    this.dialogRef.close({ type: 'confirm' });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
