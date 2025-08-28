import { Location, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { API_URL } from '@ba/core/http-client';
import { finalize, map } from 'rxjs';
import { Area } from '../../../core/crud/areas/area.model';
import { Machine } from '../../../core/crud/machines/machine.model';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';

@Component({
  selector: 'ba-machines-view',
  templateUrl: './machines-view.component.html',
  imports: [NgIf, LoadingComponent],
})
export class MachinesViewComponent implements OnInit {
  private url = inject(API_URL);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private http = inject(HttpClient);

  machines: Signal<Machine[]>;
  areaId!: number;

  area: Signal<Area | undefined>;

  loading = true;

  constructor() {
    this.areaId = +this.route.snapshot.paramMap.get('areaId')!;

    // Initialize area signal
    this.area = toSignal(
      this.http.get<any>(`${this.url}/areas/${this.areaId}`).pipe(
        map(r => r.data as Area),
        finalize(() => (this.loading = false))
      )
    );

    // Create computed signal for machines from area data
    this.machines = computed(() => {
      const currentArea = this.area();
      return currentArea?.machines || [];
    });
  }

  ngOnInit(): void {}

  onMachineClick(machine: Machine): void {
    this.router.navigateByUrl(`/app/traceability/machines/${machine.id}`);
  }

  goBack(): void {
    this.location.back();
  }
}
