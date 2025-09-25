import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  Input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ToasterService } from '@ba/core/data-access';
import { CardModule } from 'primeng/card';
import { CacheService } from 'projects/tableland/src/app/core/services/cache.service';
import { catchError, map, of } from 'rxjs';
import { BOM } from '../../../../core/crud/boms/bom.model';
import { ThreeS } from '../../../../core/crud/three-s/three-s.model';
import { ThreeSService } from '../../../../core/crud/three-s/three-s.service';
import { BomRowComponent } from '../bom-row/bom-row.component';
import { MachineStatus, VerificationRecord } from '../machine-detail.model';
import { MachineDetailStore } from '../machine-detail.store';
import { MatDialog } from '@angular/material/dialog';
import { ScanProblemDialogComponent } from '../scan-problem-dialog.component';

@Component({
  selector: 'ba-bom',
  imports: [CommonModule, BomRowComponent, CardModule],
  templateUrl: 'bom.component.html',
})
export class BomComponent implements OnInit {
  bomRow = viewChild(BomRowComponent);

  @Input({ required: true }) set bomItems(value: BOM[]) {
    this._bomItems.set(value);
    // Don't reset verifications when bomItems change if we have initial records
    if (!this.hasInitialVerifications()) {
      this.resetVerifications();
    }
  }

  // New signal input for verification records
  @Input() set verifRecords(value: VerificationRecord[] | undefined) {
    if (value) {
      this._verificationRecords.set(value);
      this.hasInitialVerifications.set(true);
    }
  }

  machineName = input.required<string>();

  private readonly toaster = inject(ToasterService);
  private readonly threeService = inject(ThreeSService);
  private cacheService = inject(CacheService);
  private machineDetailStore = inject(MachineDetailStore);
  private readonly dialog = inject(MatDialog);

  private readonly _bomItems = signal<BOM[]>([]);
  private readonly _verificationRecords = signal<VerificationRecord[]>([]);
  protected readonly isScanning = signal<boolean>(false);
  protected readonly showVerificationHistory = signal<boolean>(false);
  private readonly hasInitialVerifications = signal<boolean>(false); // Track if we have initial verification records

  protected readonly updateDate = new Date().toLocaleTimeString();

  readonly bomItems_ = this._bomItems.asReadonly();
  readonly verificationRecords = this._verificationRecords.asReadonly();

  // Computed values for UI
  readonly verificationProgress = computed(() => {
    const total = this._bomItems().length;
    const verified = this._verificationRecords().length;
    const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;
    const isComplete = verified === total && total > 0;

    return {
      verified,
      total,
      percentage,
      isComplete,
      remaining: total - verified,
    };
  });

  readonly componentSummary = computed(() => {
    const allComponents = this._bomItems().map(item => item.component);
    const verifiedComponents = this._verificationRecords().map(
      record => record.component
    );

    const summary = new Map<string, { total: number; verified: number }>();

    // Count all components
    allComponents.forEach(component => {
      summary.set(component, {
        total: (summary.get(component)?.total || 0) + 1,
        verified: summary.get(component)?.verified || 0,
      });
    });

    // Count verified components
    verifiedComponents.forEach(component => {
      const current = summary.get(component);
      if (current) {
        current.verified += 1;
      }
    });

    return Array.from(summary.entries()).map(([component, counts]) => ({
      component,
      verified: counts.verified,
      total: counts.total,
      isComplete: counts.verified === counts.total,
    }));
  });

  readonly itemsToReplenish_ = computed(() => {
    const verifiedItemIds = new Set(
      this._verificationRecords().map(record => record.bomItemId)
    );

    return this._bomItems().filter(bomItem => !verifiedItemIds.has(bomItem.id));
  });

  ngOnInit() {
    // Show success message if we received initial verification records
    if (this.hasInitialVerifications()) {
      // const recordCount = this._verificationRecords().length;
      // if (recordCount > 0) {
      //   this.toaster.showSuccess(
      //     `Loaded ${recordCount} previous verifications`
      //   );
      // }
    }
  }

  /**
   * Handle verification from scanning
   */
  onRowVerified(index: number, data: { position: string; s3: string }): void {
    if (!this.isValidScanData(data)) {
      this.toaster.showError(
        'Invalid scan data. Please scan both position and 3S code.'
      );
      return;
    }

    if (this.verificationProgress().isComplete) {
      this.toaster.showError('All items have already been verified.');
      return;
    }

    this.processVerificationScan(data.position, data.s3);
  }

  /**
   * Validate scan data
   */
  private isValidScanData(data: { position: string; s3: string }): boolean {
    return Boolean(data.s3?.trim() && data.position?.trim());
  }

  /**
   * Process verification scan with position and 3S code
   */
  private processVerificationScan(position: string, threeSCode: string): void {
    if (this.isScanning()) {
      this.toaster.showError('Please wait for the current scan to complete.');
      return;
    }

    if (this.isThreeSCodeAlreadyUsed(threeSCode)) {
      this.toaster.showError(
        'This 3S code has already been used for verification.'
      );
      return;
    }

    this.isScanning.set(true);

    this.threeService
      .load(undefined, undefined, { three_s: threeSCode })
      .pipe(
        map(response => response.content as ThreeS[]),
        catchError(error => {
          console.error('Error loading 3S data:', error);
          return of([]);
        })
      )
      .subscribe({
        next: threeSItems =>
          this.handleVerificationResult(position, threeSCode, threeSItems),
        complete: () => this.isScanning.set(false),
      });
  }

  /**
   * Handle verification result from 3S service
   */
  private handleVerificationResult(
    position: string,
    threeSCode: string,
    threeSItems: ThreeS[]
  ): void {
    if (!threeSItems?.length) {
      this.toaster.showError('No BOM found for the scanned 3S code.');
      return;
    }

    // Extract part numbers from 3S items
    const partNumbers = [...new Set(threeSItems.map(item => item.pn))];
    const threeSPn = partNumbers[0]; // Assuming first PN is the primary one

    // Step 1: Position verification - check if scanned position PN matches ThreeS PN [Deprecated]
    // if (position !== threeSPn) {
    //   this.toaster.showError(
    //     `Position mismatch. Scanned position doesn't match 3S part number`
    //   );
    //   return;
    // }

    // Step 2: Component verification - find matching unverified BOM item
    const matchingBomItem = this.findMatchingUnverifiedBomItem(partNumbers);

    if (!matchingBomItem) {
      const availableComponents = this.getAvailableComponents();
      this.toaster.showError('Element not found in BOM');

      // `Component mismatch. No unverified items found for part number '${threeSPn}'. ` +
      //   `Available components: ${availableComponents.join(', ')}`;

      return;
    }

    // Both verifications passed - record successful verification
    this.recordVerification(matchingBomItem, threeSCode, position);
    this.showSuccessMessage(matchingBomItem.component, threeSPn);

    // Clear inputs
    this.bomRow()?.clearInputs();
  }

  /**
   * Find matching unverified BOM item
   */
  private findMatchingUnverifiedBomItem(partNumbers: string[]): BOM | null {
    const verifiedItemIds = new Set(
      this._verificationRecords().map(record => record.bomItemId)
    );

    return (
      this._bomItems().find(
        bomItem =>
          !verifiedItemIds.has(bomItem.id) &&
          partNumbers.includes(bomItem.component)
      ) || null
    );
  }

  /**
   * Get list of available (unverified) components
   */
  private getAvailableComponents(): string[] {
    const verifiedItemIds = new Set(
      this._verificationRecords().map(record => record.bomItemId)
    );
    const availableComponents = this._bomItems()
      .filter(item => !verifiedItemIds.has(item.id))
      .map(item => item.component);

    return [...new Set(availableComponents)];
  }

  /**
   * Record a successful verification
   */
  private recordVerification(
    bomItem: BOM,
    threeSCode: string,
    position: string
  ): void {
    const newRecord: VerificationRecord = {
      bomItemId: bomItem.id,
      threeSCode,
      component: bomItem.component,
      position, // Store the verified position
      verifiedAt: new Date(),
    };

    this._verificationRecords.update(records => [...records, newRecord]);

    // In a real implementation, you would also save this to your backend cache here
    this.saveVerificationToCache(newRecord);
  }

  async saveVerificationToCache(value: VerificationRecord) {
    try {
      const response = await this.cacheService.setNested(
        this.machineName().toLowerCase(),
        `history.${value.bomItemId}`,
        value
      );

      if (response.success) {
        this.toaster.showSuccess('Verification record saved successfully');
      }
    } catch (error) {
      this.toaster.showError('Error saving verification record');
    }
  }

  /**
   * Show success message with details
   */
  private showSuccessMessage(component: string, partNumber: string): void {
    const progress = this.verificationProgress();
    this.toaster.showSuccess(
      `✓ Verified "${component}" (${partNumber}) - ${progress.verified}/${progress.total} complete`
    );

    if (progress.isComplete) {
      setTimeout(async () => {
        this.toaster.showSuccess('🎉 All items verified successfully!');
        this.machineDetailStore.setStatus(
          this.machineName(),
          MachineStatus.Active
        );

        try {
          await this.machineDetailStore.resumeProd();
        } catch (error) {
          this.dialog.open(ScanProblemDialogComponent, {
            minWidth: '40vw',
            maxHeight: '95vh',
            disableClose: true
          });
        }
      }, 500);
    }
  }

  /**
   * Check if 3S code was already used
   */
  private isThreeSCodeAlreadyUsed(threeSCode: string): boolean {
    return this._verificationRecords().some(
      record => record.threeSCode === threeSCode
    );
  }

  /**
   * Reset all verifications (only affects local state now)
   */
  resetVerifications(): void {
    if (!this.hasInitialVerifications()) {
      this._verificationRecords.set([]);
    }
    this.isScanning.set(false);
    this.showVerificationHistory.set(false);

    // Note: Cache clearing would now be handled by parent component
  }

  /**
   * Get verification records for display/export
   */
  getVerificationRecords(): VerificationRecord[] {
    return this._verificationRecords();
  }

  /**
   * Check if component has pending items
   */
  hasUnverifiedItems(component: string): boolean {
    const verifiedItemIds = new Set(
      this._verificationRecords().map(record => record.bomItemId)
    );
    return this._bomItems().some(
      item => item.component === component && !verifiedItemIds.has(item.id)
    );
  }

  /**
   * Toggle verification history visibility
   */
  toggleVerificationHistory(): void {
    this.showVerificationHistory.update(current => !current);
  }

  /**
   * Add a new verification record (for external use)
   */
  addVerificationRecord(record: VerificationRecord): void {
    this._verificationRecords.update(records => [...records, record]);
  }

  /**
   * Remove a verification record by bomItemId (for external use)
   */
  removeVerificationRecord(bomItemId: number): void {
    this._verificationRecords.update(records =>
      records.filter(record => record.bomItemId !== bomItemId)
    );
  }

  /**
   * Check if a specific BOM item is verified
   */
  isItemVerified(bomItemId: number): boolean {
    return this._verificationRecords().some(
      record => record.bomItemId === bomItemId
    );
  }

  /**
   * Get verification record for a specific BOM item
   */
  getVerificationRecord(bomItemId: number): VerificationRecord | undefined {
    return this._verificationRecords().find(
      record => record.bomItemId === bomItemId
    );
  }
}
