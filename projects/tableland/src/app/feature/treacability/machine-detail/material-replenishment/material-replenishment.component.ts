import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  Input,
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

type ReplenishmentRecord = {
  bomItemId: number;
  threeSCode: string;
  component: string;
  replenishedAt: Date;
  positionPn: string;
  batchId?: string;
};

@Component({
  selector: 'ba-material-replenishment',
  imports: [CommonModule, BomRowComponent, CardModule],
  templateUrl: 'material-replenishment.component.html',
})
export class MaterialReplenishmentComponent {
  bomRow = viewChild(BomRowComponent);

  @Input({ required: true }) set itemsToReplenish(value: BOM[]) {
    this._itemsToReplenish.set(
      value ?? [
        {
          pn: '1-2487110-10',
          op: '0020',
          workstation: 'F-51L4-A',
          component: '2203270-10',
          id: 1003,
        },
        {
          pn: '1-2487110-10',
          op: '0020',
          workstation: 'F-51L4-A',
          component: '2203270-11',
          id: 1004,
        },
      ]
    );
    this.resetReplenishments();
  }

  @Input() productionStatus: 'running' | 'paused' | 'stopped' = 'paused';
  @Input() currentOperation?: string;
  @Input() workstation?: string;

  private readonly toaster = inject(ToasterService);
  private readonly threeService = inject(ThreeSService);

  private readonly _itemsToReplenish = signal<BOM[]>([]);
  protected readonly replenishmentRecords = signal<ReplenishmentRecord[]>([
    {
      bomItemId: 1004,
      threeSCode: '3SILCN0097LXY3',
      component: '2203270-11',
      replenishedAt: new Date('2025-08-25T16:21:56.321Z'),
      positionPn: '2203270-11',
    },
    {
      bomItemId: 1002,
      threeSCode: '3SILCN0097LXY1',
      component: '2203270-9',
      positionPn: '2203270-9',
      replenishedAt: new Date('2025-08-25T16:26:23.796Z'),
    },
  ]);
  protected readonly isScanning = signal<boolean>(false);
  protected readonly showReplenishmentHistory = signal<boolean>(false);

  protected readonly updateDate = new Date().toLocaleTimeString();

  readonly itemsToReplenish_ = this._itemsToReplenish.asReadonly();

  // Computed values for UI
  readonly replenishmentProgress = computed(() => {
    const total = this._itemsToReplenish()?.length;
    const replenished = this.replenishmentRecords().length;
    const percentage = total > 0 ? Math.round((replenished / total) * 100) : 0;
    const isComplete = replenished === total && total > 0;

    return {
      replenished,
      total,
      percentage,
      isComplete,
      remaining: total - replenished,
    };
  });

  readonly componentSummary = computed(() => {
    const allComponents = this._itemsToReplenish().map(item => item.component);
    const replenishedComponents = this.replenishmentRecords().map(
      record => record.component
    );

    const summary = new Map<string, { total: number; replenished: number }>();

    // Count all components needing replenishment
    allComponents.forEach(component => {
      summary.set(component, {
        total: (summary.get(component)?.total || 0) + 1,
        replenished: summary.get(component)?.replenished || 0,
      });
    });

    // Count replenished components
    replenishedComponents.forEach(component => {
      const current = summary.get(component);
      if (current) {
        current.replenished += 1;
      }
    });

    return Array.from(summary.entries()).map(([component, counts]) => ({
      component,
      replenished: counts.replenished,
      total: counts.total,
      isComplete: counts.replenished === counts.total,
    }));
  });

  readonly nextItemToReplenish = computed(() => {
    const replenishedItemIds = new Set(
      this.replenishmentRecords().map(record => record.bomItemId)
    );

    return this._itemsToReplenish().find(
      item => !replenishedItemIds.has(item.id)
    );
  });

  readonly criticalComponents = computed(() => {
    return this.componentSummary().filter(comp => !comp.isComplete);
  });

  /**
   * Handle replenishment scan
   */
  onRowReplenished(
    index: number,
    data: { position: string; s3: string }
  ): void {
    if (!this.isValidScanData(data)) {
      this.toaster.showError(
        'Invalid scan data. Please scan both position and 3S code.'
      );
      return;
    }

    if (this.replenishmentProgress().isComplete) {
      this.toaster.showError('All materials have already been replenished.');
      return;
    }

    this.processReplenishmentScan(data.position, data.s3);
  }

  /**
   * Validate scan data
   */
  private isValidScanData(data: { position: string; s3: string }): boolean {
    return Boolean(data.s3?.trim() && data.position?.trim());
  }

  /**
   * Process replenishment scan
   */
  private processReplenishmentScan(
    positionPn: string,
    threeSCode: string
  ): void {
    if (this.isScanning()) {
      this.toaster.showError('Please wait for the current scan to complete.');
      return;
    }

    if (this.isThreeSCodeAlreadyUsed(threeSCode)) {
      this.toaster.showError(
        'This 3S code has already been used for replenishment.'
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
          this.handleReplenishmentResult(positionPn, threeSCode, threeSItems),
        complete: () => this.isScanning.set(false),
      });
  }

  /**
   * Handle replenishment result from 3S service
   */
  private handleReplenishmentResult(
    positionPn: string,
    threeSCode: string,
    threeSItems: ThreeS[]
  ): void {
    if (!threeSItems?.length) {
      this.toaster.showError('No BOM found for the scanned 3S code.');
      return;
    }

    const partNumbers = [...new Set(threeSItems.map(item => item.pn))];
    const threeSPn = partNumbers[0];
    const batchId = threeSItems[0].batch; // Assuming batch_id exists in ThreeS

    // Position verification
    if (positionPn !== threeSPn) {
      this.toaster.showError(
        `Position mismatch. Scanned position doesn't match 3S part number`
      );
      return;
    }

    // Find matching item that needs replenishment
    const matchingBomItem = this.findMatchingUnreplenishedBomItem(partNumbers);

    if (!matchingBomItem) {
      const availableComponents = this.getAvailableComponents();
      this.toaster.showError(
        `Material not needed for replenishment. Required components: ${availableComponents.join(', ')}`
      );
      return;
    }

    // Record successful replenishment with batchId from ThreeS
    this.recordReplenishment(matchingBomItem, threeSCode, positionPn, batchId);
    this.showSuccessMessage(matchingBomItem.component, threeSPn);

    // Clear inputs
    this.bomRow()?.clearInputs();
  }

  /**
   * Find matching unreplenished BOM item
   */
  private findMatchingUnreplenishedBomItem(partNumbers: string[]): BOM | null {
    const replenishedItemIds = new Set(
      this.replenishmentRecords().map(record => record.bomItemId)
    );

    return (
      this._itemsToReplenish().find(
        bomItem =>
          !replenishedItemIds.has(bomItem.id) &&
          partNumbers.includes(bomItem.component)
      ) || null
    );
  }

  /**
   * Get list of components that still need replenishment
   */
  private getAvailableComponents(): string[] {
    const replenishedItemIds = new Set(
      this.replenishmentRecords().map(record => record.bomItemId)
    );
    const availableComponents = this._itemsToReplenish()
      .filter(item => !replenishedItemIds.has(item.id))
      .map(item => item.component);

    return [...new Set(availableComponents)];
  }

  /**
   * Record a successful replenishment
   */
  private recordReplenishment(
    bomItem: BOM,
    threeSCode: string,
    positionPn: string,
    batchId: string
  ): void {
    const newRecord: ReplenishmentRecord = {
      bomItemId: bomItem.id,
      threeSCode,
      component: bomItem.component,
      positionPn,
      replenishedAt: new Date(),
      batchId: batchId,
    };

    this.replenishmentRecords.update(records => [...records, newRecord]);
  }

  /**
   * Show success message with details
   */
  private showSuccessMessage(component: string, partNumber: string): void {
    const progress = this.replenishmentProgress();
    this.toaster.showSuccess(
      `✓ Replenished "${component}" (${partNumber}) - ${progress.replenished}/${progress.total} complete`
    );

    if (progress.isComplete) {
      setTimeout(() => {
        this.toaster.showSuccess(
          '🎉 All materials replenished! Production can resume.'
        );
      }, 500);
    }
  }

  /**
   * Check if 3S code was already used
   */
  private isThreeSCodeAlreadyUsed(threeSCode: string): boolean {
    return this.replenishmentRecords().some(
      record => record.threeSCode === threeSCode
    );
  }

  /**
   * Reset all replenishments
   */
  resetReplenishments(): void {
    this.replenishmentRecords.set([]);
    this.isScanning.set(false);
    this.showReplenishmentHistory.set(false);
  }

  /**
   * Get replenishment records for display/export
   */
  getReplenishmentRecords(): ReplenishmentRecord[] {
    return this.replenishmentRecords();
  }

  /**
   * Check if component has items that still need replenishment
   */
  hasUnreplenishedItems(component: string): boolean {
    const replenishedItemIds = new Set(
      this.replenishmentRecords().map(record => record.bomItemId)
    );
    return this._itemsToReplenish().some(
      item => item.component === component && !replenishedItemIds.has(item.id)
    );
  }

  /**
   * Toggle replenishment history visibility
   */
  toggleReplenishmentHistory(): void {
    this.showReplenishmentHistory.update(current => !current);
  }

  /**
   * Get production status color
   */
  getProductionStatusColor(): string {
    switch (this.productionStatus) {
      case 'running':
        return 'text-green-600';
      case 'paused':
        return 'text-yellow-600';
      case 'stopped':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get production status icon
   */
  getProductionStatusIcon(): string {
    switch (this.productionStatus) {
      case 'running':
        return '▶️';
      case 'paused':
        return '⏸️';
      case 'stopped':
        return '⏹️';
      default:
        return '❓';
    }
  }

  isItemReplenished(itemId: number): boolean {
    return this.replenishmentRecords().some(r => r.bomItemId === itemId);
  }
}
