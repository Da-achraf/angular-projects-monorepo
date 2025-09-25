import { Location, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { API_URL } from '@ba/core/http-client';
import { TippyDirective } from '@ngneat/helipopper';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { Area } from '../../../core/crud/areas/area.model';
import { Machine } from '../../../core/crud/machines/machine.model';
import { WebSocketService } from '../../../core/services/ws-area.service';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';
import { MachineStatus } from '../machine-detail/machine-detail.model';

@Component({
  selector: 'ba-machines-view',
  templateUrl: './machines-view.component.html',
  imports: [LoadingComponent, NgClass, TippyDirective],
})
export class MachinesViewComponent implements OnInit {
  private url = inject(API_URL);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private http = inject(HttpClient);
  private wsService = inject(WebSocketService);

  MachineStatus = MachineStatus;

  loading = signal(true);

  // Fix: Add requireSync and initialValue to ensure immediate availability
  areaId = toSignal(
    this.route.paramMap.pipe(map(params => +params.get('areaId')!)),
    { requireSync: true } // This ensures the signal has an initial value
  );

  // Fix: Add error handling and better observable management
  area = toSignal(
    toObservable(this.areaId).pipe(
      tap(() => this.loading.set(true)),
      switchMap(areaId => {
        // Add null check
        if (!areaId) {
          this.loading.set(false);
          return of(undefined);
        }

        return this.http.get<any>(`${this.url}/areas/${areaId}`).pipe(
          map(r => r.data as Area),
          catchError(error => {
            console.error('Error fetching area:', error);
            this.loading.set(false);
            return of(undefined);
          }),
          finalize(() => this.loading.set(false))
        );
      })
    )
  );

  // Reactive machine statuses signal
  machineStatuses = computed(() => {
    const currentAreaId = this.areaId();
    if (!currentAreaId) {
      return {};
    }
    // Get the signal from WebSocket service and return its current value
    return this.wsService.getAreaMachineStatuses(currentAreaId)();
  });

  machines = computed(() => {
    const currentArea = this.area();
    return currentArea?.machines || [];
  });

  // Enhanced machines with their current status
  machinesWithStatus = computed(() => {
    const machines = this.machines();
    const statuses = this.machineStatuses();

    return machines.map(machine => ({
      ...machine,
      status: statuses[machine.name.toLowerCase()] || null,
    }));
  });

  private effectRef = effect(() => {
    const currentAreaId = this.areaId();
    if (currentAreaId) {
      this.wsService.connectToArea(currentAreaId);
      // The getAreaMachineStatuses call returns a signal, so we don't need to call it here
      // The computed signal above will reactively call it when needed
    }
  });

  ngOnInit(): void {
    // Optional: Add initial loading check
    if (this.areaId()) {
      console.log('Area ID loaded:', this.areaId());
    }
  }

  ngOnDestroy(): void {
    // Clean up effect
    this.effectRef.destroy();
  }

  onMachineClick(machine: Machine): void {
    const url = `/app/traceability/machines/${this.areaId()}/${machine.id}`;

    console.log('')
    this.router.navigateByUrl(url);
  }

  goBack(): void {
    this.location.back();
  }

  // Helper method to get status for a specific machine (optional)
  getMachineStatus(machineName: string): any | null {
    return this.machineStatuses()[machineName.toLowerCase()] || null;
  }
}
