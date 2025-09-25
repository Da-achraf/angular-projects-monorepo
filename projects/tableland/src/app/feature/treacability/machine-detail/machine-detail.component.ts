import { CommonModule, Location } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  Signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../../../core/services/ws-area.service';
import { BaButtonComponent } from '../../../ui/components/button/button.component';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';
import { BomComponent } from './bom/bom.component';
import { ConfirmRescanDialogComponent } from './confirm-rescan-dialog.component';
import { MachineDetailStore } from './machine-detail.store';
import { MaterialReplenishmentComponent } from './material-replenishment/material-replenishment.component';
import { ScannerComponent } from './scanner/scanner.component';

@Component({
  selector: 'ba-machine-detail',
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    ScannerComponent,
    BomComponent,
    MaterialReplenishmentComponent,
    BaButtonComponent,
  ],
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.scss'],
})
export class MachineDetailComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  // Inject the store
  private readonly store = inject(MachineDetailStore);
  private wsService = inject(WebSocketService);

  // Expose store properties to template
  readonly machine = this.store.machine;
  readonly status = this.store.status;
  readonly pn = this.store.pn;
  readonly po = this.store.po;
  readonly bom = this.store.bom;
  readonly verifiedRecords = this.store.verifiedRecords;
  readonly machineName = this.store.machineName;
  readonly error = this.store.error;
  readonly viewState = this.store.viewState;

  // Template convenience properties
  readonly isAnyLoading = this.store.isAnyLoading;
  readonly showScanning = this.store.canShowScanning;
  readonly showBom = this.store.canShowBom;
  readonly showMaterialReplenishment = this.store.canShowMaterialReplenishment;

  // Route parameter
  private readonly machineId = this.route.snapshot.paramMap.get('machineId');
  private readonly areaId = this.route.snapshot.paramMap.get('areaId');

  machineStatus = computed(() => {
    const machineName = this.machineName();
    const areaId = this.areaId ? Number.parseInt(this.areaId) : null;

    if (!machineName || !areaId) return;

    return this.wsService.getMachineStatus(areaId, machineName)();
  });

  machineStatusEffect = effect(async () => {
    console.log('machineStatus: ', this.machineStatus());

    await this.store.reloadAllData();
  });

  constructor() {
    if (!this.machineId) {
      throw new Error('Machine id was not provided');
    }
  }

  ngOnInit(): void {
    // Reset store state when component initializes
    this.store.resetState();

    const areaId = this.areaId;
    if (areaId) {
      this.store.setAreaId(Number.parseInt(areaId));
      this.wsService.connectToArea(Number.parseInt(areaId));
    }

    // Load machine data
    if (this.machineId) this.store.loadMachine(this.machineId);
  }

  ngOnDestroy(): void {
    // Store will handle its own cleanup
    // No need for manual subscription management
  }

  async onReload() {
    await this.store.reloadAllData();
  }

  // Event handlers - delegate to store
  async onScanned(result: { po: string; pn: string }): Promise<void> {
    await this.store.handleScannedResult(result);
  }

  async onMaterialReplenished(): Promise<void> {
    await this.store.handleMaterialReplenishment();
  }

  onRescanClicked(): void {
    this.dialog
      .open(ConfirmRescanDialogComponent, {
        minWidth: '40vw',
        maxHeight: '95vh',
        data: {
          header: 'Confirm new scan',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (res: { type: 'confirm' | 'cancel' }) => {
          if (res?.type === 'confirm') {
            const areaId = this.areaId;
            if (areaId) {
              await this.store.handleRescanRequest(Number.parseInt(areaId));
            }
          }
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
