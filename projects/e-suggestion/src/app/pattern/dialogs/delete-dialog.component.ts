import { Component, inject } from '@angular/core';
import { BaButtonComponent } from '../../ui/components/button/button.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from './base-dialog.component';

interface DeleteDialogData {
  label: string;
}

@Component({
  selector: 'ba-delete-dialog',
  template: `
    <ba-base-dialog (cancel)="cancel()">
      <div class="w-full flex flex-col gap-y-3 p-4 items-center ">
        <span class="p-3 rounded-full bg-red-100">
          <span class="p-2 bg-red-200 rounded-full">
            <i class="fa-solid fa-circle-exclamation text-red-400"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold">You're about to delete</span>
        <span class="text-[1em]"
          >Are you sure you want to delete this {{ data.label }}? This action
          cannot be undone.
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
            label="Delete"
            icon="fa-trash"
            buttonClass="bg-red-400 text-gray-100 hover:bg-red-500"
            (onClick)="delete()"
          />
        </div>
      </div>
    </ba-base-dialog>
  `,
  imports: [BaButtonComponent, BaseDialogComponent],
})
export class DeleteDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>);
  protected readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);

  delete() {
    this.dialogRef.close({ type: 'delete' });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
