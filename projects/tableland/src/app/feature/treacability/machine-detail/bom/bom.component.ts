// import { CommonModule } from '@angular/common';
// import {
//   Component,
//   computed,
//   inject,
//   Input,
//   signal,
//   viewChild,
// } from '@angular/core';
// import { ToasterService } from '@ba/core/data-access';
// import { CardModule } from 'primeng/card';
// import { catchError, map, of } from 'rxjs';
// import { BOM } from '../../../../core/crud/boms/bom.model';
// import { ThreeS } from '../../../../core/crud/three-s/three-s.model';
// import { ThreeSService } from '../../../../core/crud/three-s/three-s.service';
// import { BomRowComponent } from '../bom-row/bom-row.component';

// type VerificationRecord = {
//   bomItemId: number;
//   threeSCode: string;
//   component: string;
//   verifiedAt: Date;
//   positionPn: string;
// };

// @Component({
//   selector: 'ba-bom',
//   imports: [CommonModule, BomRowComponent, CardModule],
//   templateUrl: 'bom.component.html',
// })
// export class BomComponent {
//   bomRow = viewChild(BomRowComponent);

//   @Input({ required: true }) set bomItems(value: BOM[]) {
//     this._bomItems.set(value);
//     this.resetVerifications();
//   }

//   private readonly toaster = inject(ToasterService);
//   private readonly threeService = inject(ThreeSService);

//   private readonly _bomItems = signal<BOM[]>([]);
//   private readonly verificationRecords = signal<VerificationRecord[]>([]);
//   protected readonly isScanning = signal<boolean>(false);
//   protected readonly showVerificationHistory = signal<boolean>(false);

//   protected readonly updateDate = new Date().toLocaleTimeString();

//   readonly bomItems_ = this._bomItems.asReadonly();

//   // Computed values for UI
//   readonly verificationProgress = computed(() => {
//     const total = this._bomItems().length;
//     const verified = this.verificationRecords().length;
//     const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;
//     const isComplete = verified === total && total > 0;

//     return {
//       verified,
//       total,
//       percentage,
//       isComplete,
//       remaining: total - verified,
//     };
//   });

//   readonly componentSummary = computed(() => {
//     const allComponents = this._bomItems().map(item => item.component);
//     const verifiedComponents = this.verificationRecords().map(
//       record => record.component
//     );

//     const summary = new Map<string, { total: number; verified: number }>();

//     // Count all components
//     allComponents.forEach(component => {
//       summary.set(component, {
//         total: (summary.get(component)?.total || 0) + 1,
//         verified: summary.get(component)?.verified || 0,
//       });
//     });

//     // Count verified components
//     verifiedComponents.forEach(component => {
//       const current = summary.get(component);
//       if (current) {
//         current.verified += 1;
//       }
//     });

//     return Array.from(summary.entries()).map(([component, counts]) => ({
//       component,
//       verified: counts.verified,
//       total: counts.total,
//       isComplete: counts.verified === counts.total,
//     }));
//   });

//   /**
//    * Handle verification from scanning
//    */
//   onRowVerified(index: number, data: { position: string; s3: string }): void {
//     if (!this.isValidScanData(data)) {
//       this.toaster.showError(
//         'Invalid scan data. Please scan both position and 3S code.'
//       );
//       return;
//     }

//     if (this.verificationProgress().isComplete) {
//       this.toaster.showError('All items have already been verified.');
//       return;
//     }

//     this.processVerificationScan(data.position, data.s3);
//   }

//   /**
//    * Validate scan data
//    */
//   private isValidScanData(data: { position: string; s3: string }): boolean {
//     return Boolean(data.s3?.trim() && data.position?.trim());
//   }

//   /**
//    * Process verification scan with position and 3S code
//    */
//   private processVerificationScan(
//     positionPn: string,
//     threeSCode: string
//   ): void {
//     if (this.isScanning()) {
//       this.toaster.showError('Please wait for the current scan to complete.');
//       return;
//     }

//     if (this.isThreeSCodeAlreadyUsed(threeSCode)) {
//       this.toaster.showError(
//         'This 3S code has already been used for verification.'
//       );
//       return;
//     }

//     this.isScanning.set(true);

//     this.threeService
//       .load(undefined, undefined, { three_s: threeSCode })
//       .pipe(
//         map(response => response.content as ThreeS[]),
//         catchError(error => {
//           console.error('Error loading 3S data:', error);
//           return of([]);
//         })
//       )
//       .subscribe({
//         next: threeSItems =>
//           this.handleVerificationResult(positionPn, threeSCode, threeSItems),
//         complete: () => this.isScanning.set(false),
//       });
//   }

//   /**
//    * Handle verification result from 3S service
//    */
//   private handleVerificationResult(
//     positionPn: string,
//     threeSCode: string,
//     threeSItems: ThreeS[]
//   ): void {
//     if (!threeSItems?.length) {
//       this.toaster.showError('No BOM found for the scanned 3S code.');
//       return;
//     }

//     // Extract part numbers from 3S items
//     const partNumbers = [...new Set(threeSItems.map(item => item.pn))];
//     const threeSPn = partNumbers[0]; // Assuming first PN is the primary one

//     // Step 1: Position verification - check if scanned position PN matches ThreeS PN
//     if (positionPn !== threeSPn) {
//       this.toaster.showError(
//         `Position mismatch. Scanned position doesn't match 3S part number`
//       );
//       return;
//     }

//     // Step 2: Component verification - find matching unverified BOM item
//     const matchingBomItem = this.findMatchingUnverifiedBomItem(partNumbers);

//     if (!matchingBomItem) {
//       const availableComponents = this.getAvailableComponents();
//       this.toaster.showError('Element not found in BOM');

//       // `Component mismatch. No unverified items found for part number '${threeSPn}'. ` +
//       //   `Available components: ${availableComponents.join(', ')}`;

//       return;
//     }

//     // Both verifications passed - record successful verification
//     this.recordVerification(matchingBomItem, threeSCode, positionPn);
//     this.showSuccessMessage(matchingBomItem.component, threeSPn);

//     // Clear inputs
//     this.bomRow()?.clearInputs();
//   }

//   /**
//    * Find matching unverified BOM item
//    */
//   private findMatchingUnverifiedBomItem(partNumbers: string[]): BOM | null {
//     const verifiedItemIds = new Set(
//       this.verificationRecords().map(record => record.bomItemId)
//     );

//     return (
//       this._bomItems().find(
//         bomItem =>
//           !verifiedItemIds.has(bomItem.id) &&
//           partNumbers.includes(bomItem.component)
//       ) || null
//     );
//   }

//   /**
//    * Get list of available (unverified) components
//    */
//   private getAvailableComponents(): string[] {
//     const verifiedItemIds = new Set(
//       this.verificationRecords().map(record => record.bomItemId)
//     );
//     const availableComponents = this._bomItems()
//       .filter(item => !verifiedItemIds.has(item.id))
//       .map(item => item.component);

//     return [...new Set(availableComponents)];
//   }

//   /**
//    * Record a successful verification
//    */
//   private recordVerification(
//     bomItem: BOM,
//     threeSCode: string,
//     positionPn: string
//   ): void {
//     const newRecord: VerificationRecord = {
//       bomItemId: bomItem.id,
//       threeSCode,
//       component: bomItem.component,
//       positionPn, // Store the verified position PN
//       verifiedAt: new Date(),
//     };

//     console.log('ver: ', newRecord);

//     this.verificationRecords.update(records => [...records, newRecord]);
//   }

//   /**
//    * Show success message with details
//    */
//   private showSuccessMessage(component: string, partNumber: string): void {
//     const progress = this.verificationProgress();
//     this.toaster.showSuccess(
//       `✓ Verified "${component}" (${partNumber}) - ${progress.verified}/${progress.total} complete`
//     );

//     if (progress.isComplete) {
//       setTimeout(() => {
//         this.toaster.showSuccess('🎉 All items verified successfully!');
//       }, 500);
//     }
//   }

//   /**
//    * Check if 3S code was already used
//    */
//   private isThreeSCodeAlreadyUsed(threeSCode: string): boolean {
//     return this.verificationRecords().some(
//       record => record.threeSCode === threeSCode
//     );
//   }

//   /**
//    * Reset all verifications
//    */
//   resetVerifications(): void {
//     this.verificationRecords.set([]);
//     this.isScanning.set(false);
//     this.showVerificationHistory.set(false);
//   }

//   /**
//    * Get verification records for display/export
//    */
//   getVerificationRecords(): VerificationRecord[] {
//     return this.verificationRecords();
//   }

//   /**
//    * Check if component has pending items
//    */
//   hasUnverifiedItems(component: string): boolean {
//     const verifiedItemIds = new Set(
//       this.verificationRecords().map(record => record.bomItemId)
//     );
//     return this._bomItems().some(
//       item => item.component === component && !verifiedItemIds.has(item.id)
//     );
//   }

//   /**
//    * Toggle verification history visibility
//    */
//   toggleVerificationHistory(): void {
//     this.showVerificationHistory.update(current => !current);
//   }
// }

import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ToasterService } from '@ba/core/data-access';
import { CardModule } from 'primeng/card';
import { catchError, map, of } from 'rxjs';
import { BOM } from '../../../../core/crud/boms/bom.model';
import { ThreeS } from '../../../../core/crud/three-s/three-s.model';
import { ThreeSService } from '../../../../core/crud/three-s/three-s.service';
import { BomRowComponent } from '../bom-row/bom-row.component';

type VerificationRecord = {
  bomItemId: number;
  threeSCode: string;
  component: string;
  verifiedAt: Date;
  positionPn: string;
};

@Component({
  selector: 'ba-bom',
  imports: [CommonModule, BomRowComponent, CardModule],
  templateUrl: 'bom.component.html',
})
export class BomComponent implements OnInit {
  bomRow = viewChild(BomRowComponent);

  @Input({ required: true }) set bomItems(value: BOM[]) {
    this._bomItems.set(value);
    // Don't reset verifications when bomItems change if we have cached data
    if (!this.hasRestoredCache()) {
      this.resetVerifications();
    }
  }

  private readonly toaster = inject(ToasterService);
  private readonly threeService = inject(ThreeSService);

  private readonly _bomItems = signal<BOM[]>([]);
  private readonly verificationRecords = signal<VerificationRecord[]>([]);
  protected readonly isScanning = signal<boolean>(false);
  protected readonly showVerificationHistory = signal<boolean>(false);
  private readonly hasRestoredCache = signal<boolean>(false); // Track if we've restored from cache

  protected readonly updateDate = new Date().toLocaleTimeString();

  readonly bomItems_ = this._bomItems.asReadonly();

  // Computed values for UI
  readonly verificationProgress = computed(() => {
    const total = this._bomItems().length;
    const verified = this.verificationRecords().length;
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
    const verifiedComponents = this.verificationRecords().map(
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

  ngOnInit() {
    // Attempt to restore verification records from cache when component initializes
    this.restoreVerificationRecords();
  }

  /**
   * Attempt to restore verification records from backend cache
   */
  private restoreVerificationRecords(): void {
    // This would be replaced with your actual API call to get cached verifications
    // For demonstration, I'm using a mock implementation
    this.fetchCachedVerifications().subscribe({
      next: cachedRecords => {
        if (cachedRecords && cachedRecords.length > 0) {
          this.verificationRecords.set(cachedRecords);
          this.hasRestoredCache.set(true);
          this.toaster.showSuccess(
            `Restored ${cachedRecords.length} previous verifications`
          );
        }
      },
      error: error => {
        console.error('Failed to restore cached verifications:', error);
        // Don't show error to user as this is a background process
      },
    });
  }

  /**
   * Mock method to fetch cached verifications - replace with your actual API call
   */
  private fetchCachedVerifications() {
    // In a real implementation, this would be an HTTP call to your backend
    // that returns the cached verification records for this BOM/session

    // For now, return an empty array as a placeholder
    return of([
      // {
      //   bomItemId: 1002,
      //   threeSCode: '3SILCN0097LXY1',
      //   component: '2203270-9',
      //   positionPn: '2203270-9',
      //   verifiedAt: new Date('2025-08-26T08:59:20.346Z'),
      // },
      // {
      //   bomItemId: 1004,
      //   threeSCode: '3SILCN0097LXY3',
      //   component: '2203270-11',
      //   positionPn: '2203270-11',
      //   verifiedAt: new Date('2025-08-26T08:56:53.132Z'),
      // },
    ] as VerificationRecord[]);

    // Example of what a real implementation might look like:
    /*
    return this.http.get<VerificationRecord[]>(`/api/bom-verification/cache/${this.bomId}`).pipe(
      catchError(error => {
        console.error('Error fetching cached verifications:', error);
        return of([]);
      })
    );
    */
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
  private processVerificationScan(
    positionPn: string,
    threeSCode: string
  ): void {
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
          this.handleVerificationResult(positionPn, threeSCode, threeSItems),
        complete: () => this.isScanning.set(false),
      });
  }

  /**
   * Handle verification result from 3S service
   */
  private handleVerificationResult(
    positionPn: string,
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

    // Step 1: Position verification - check if scanned position PN matches ThreeS PN
    if (positionPn !== threeSPn) {
      this.toaster.showError(
        `Position mismatch. Scanned position doesn't match 3S part number`
      );
      return;
    }

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
    this.recordVerification(matchingBomItem, threeSCode, positionPn);
    this.showSuccessMessage(matchingBomItem.component, threeSPn);

    // Clear inputs
    this.bomRow()?.clearInputs();
  }

  /**
   * Find matching unverified BOM item
   */
  private findMatchingUnverifiedBomItem(partNumbers: string[]): BOM | null {
    const verifiedItemIds = new Set(
      this.verificationRecords().map(record => record.bomItemId)
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
      this.verificationRecords().map(record => record.bomItemId)
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
    positionPn: string
  ): void {
    const newRecord: VerificationRecord = {
      bomItemId: bomItem.id,
      threeSCode,
      component: bomItem.component,
      positionPn, // Store the verified position PN
      verifiedAt: new Date(),
    };

    console.log('ver: ', newRecord);

    this.verificationRecords.update(records => [...records, newRecord]);

    // In a real implementation, you would also save this to your backend cache here
    // this.saveVerificationToCache(newRecord);
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
      setTimeout(() => {
        this.toaster.showSuccess('🎉 All items verified successfully!');
      }, 500);
    }
  }

  /**
   * Check if 3S code was already used
   */
  private isThreeSCodeAlreadyUsed(threeSCode: string): boolean {
    return this.verificationRecords().some(
      record => record.threeSCode === threeSCode
    );
  }

  /**
   * Reset all verifications
   */
  resetVerifications(): void {
    this.verificationRecords.set([]);
    this.isScanning.set(false);
    this.showVerificationHistory.set(false);
    this.hasRestoredCache.set(false);

    // In a real implementation, you would also clear the backend cache here
    // this.clearVerificationCache();
  }

  /**
   * Get verification records for display/export
   */
  getVerificationRecords(): VerificationRecord[] {
    return this.verificationRecords();
  }

  /**
   * Check if component has pending items
   */
  hasUnverifiedItems(component: string): boolean {
    const verifiedItemIds = new Set(
      this.verificationRecords().map(record => record.bomItemId)
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
}
