import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnDestroy, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';

import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from '@ba/core/data-access';
import { API_URL } from '@ba/core/http-client';
import { finalize, map, Subject } from 'rxjs';
import { BOM } from '../../../core/crud/boms/bom.model';
import { BOMService } from '../../../core/crud/boms/bom.service';
import { BomComponent } from './bom/bom.component';
import { ScannerComponent } from './scanner/scanner.component';

interface Machine {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
}

@Component({
  selector: 'ba-machine-detail',
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    ScannerComponent,
    BomComponent,
  ],
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.scss'],
})
export class MachineDetailComponent implements OnDestroy {
  private location = inject(Location);
  private destroy$ = new Subject<void>();

  private toaster = inject(ToasterService);
  private http = inject(HttpClient);
  private url = inject(API_URL);
  private route = inject(ActivatedRoute);
  private bomService = inject(BOMService);

  // Component state
  machineId!: string | null;
  bom: BOM[] = [];

  // Booleans signals
  showScanning = signal(true);
  showBom = signal(false);

  pn = signal('');
  po = signal('');

  // Signals for reactive state management
  machine: Signal<Machine | undefined>;
  loading = signal(true);

  constructor() {
    const machineId = this.route.snapshot.paramMap.get('machineId');

    // Initialize area signal
    this.machine = toSignal(
      this.http.get<any>(`${this.url}/machines/${machineId}`).pipe(
        map(r => r.data as Machine),
        finalize(() => this.loading.set(false))
      )
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigation
  goBack(): void {
    this.location.back();
  }

  onScanned(result: { po: string; pn: string }) {
    // Check if the bom is found
    this.bomService
      .loadBom(result.pn, this.machine()?.name as string)
      .subscribe({
        next: bom => {
          this.bom = bom;
          this.showScanning.set(false);

          this.pn.set(result.pn);
          this.po.set(result.po);
        },
        error: _ => {
          this.toaster.showError('No BOM found for the request PN');
          console.log('Bom not found');
        },
      });

    // Log a row in comparaison table (after doing comparaison)
  }
}
