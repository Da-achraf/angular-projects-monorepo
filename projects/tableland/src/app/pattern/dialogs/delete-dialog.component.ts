import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ba/core/data-access';
import { BaButtonComponent } from '../../ui/components/button/button.component';
import { BaseDialogComponent } from './base-dialog.component';

interface DeleteDialogData {
  label: string;
}

@Component({
  selector: 'ba-delete-dialog',
  template: `
    <ba-base-dialog (cancel)="cancel()">
      <div class="flex w-full flex-col items-center gap-y-3 p-4">
        <span class="rounded-full bg-red-100 p-3">
          <span class="rounded-full bg-red-200 p-2">
            <i class="fa-solid fa-circle-exclamation text-red-400"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold">{{
          'delete-warning-title' | translate
        }}</span>
        <span class="text-[1em]"
          >{{ 'delete-warning-message' | translate }}
        </span>

        <div class="flex w-full items-center justify-center gap-x-3 py-3">
          <ba-button
            class="flex-1"
            [label]="'cancel' | translate"
            icon="fa-xmark"
            buttonClass="text-gray-500 border border-gray-400 bg-neutral-50 hover:bg-neutral-100"
            (onClick)="cancel()" />
          <ba-button
            class="flex-1"
            [label]="'delete' | translate"
            icon="fa-trash"
            buttonClass="bg-red-400 text-gray-100 hover:bg-red-500"
            (onClick)="delete()" />
        </div>
      </div>
    </ba-base-dialog>
  `,
  imports: [BaButtonComponent, BaseDialogComponent, TranslatePipe],
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
