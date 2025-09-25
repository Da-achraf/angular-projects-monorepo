import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { MachineDetailStore } from './machine-detail.store';

@Component({
  selector: 'ba-scan-problem-dialog',
  template: `
    <div>
      <div class="flex w-full flex-col items-center gap-y-3 p-4">
        <span class="rounded-full bg-red-100 p-3">
          <span class="rounded-full bg-red-200 p-2">
            <i class="fa-solid fa-circle-exclamation text-red-500"></i>
          </span>
        </span>
        <span class="text-[1em] font-semibold"
          >A problem occured while trying to send data to machine</span
        >
        <span class="text-[1em]"
          >Please check the machine script and reconfirm</span
        >

        <div class="flex w-full items-center justify-center gap-x-3 py-3">
          <ba-button
            class="flex-1"
            label="Confirm"
            icon="fa-check-double"
            buttonClass="bg-green-400 text-gray-50 hover:bg-green-500"
            (onClick)="confirm()" />
        </div>
      </div>
    </div>
  `,
  imports: [BaButtonComponent],
})
export class ScanProblemDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ScanProblemDialogComponent>);
  private machineDetailStore = inject(MachineDetailStore);

  ngOnInit() {
    // Add event listener to prevent page reload
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  ngOnDestroy() {
    // Clean up event listener
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    // This will show browser's default confirmation dialog
    event.preventDefault();
    event.returnValue = ''; // Required for some browsers
    return ''; // Required for some browsers
  };

  async confirm() {
    try {
      // Remove the event listener before closing to allow normal navigation
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      await this.machineDetailStore.resumeProd();
      this.close();
    } catch (error) {
      // Re-add the event listener if there was an error
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  close() {
    // Remove the event listener before closing
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    this.dialogRef.close();
  }
}
