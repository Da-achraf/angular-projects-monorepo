import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Area } from '../../../core/crud/areas/area.model';
import { AreaStore } from '../../../core/crud/areas/area.store';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';

@Component({
  selector: 'ba-areas-view',
  templateUrl: './areas-view.component.html',
  imports: [NgIf, NgFor, LoadingComponent],
})
export class AreasViewComponent {
  private readonly areaStore = inject(AreaStore);

  private router = inject(Router);

  areas = this.areaStore.allEntities;

  loading = this.areaStore.isLoading;

  onAreaClick(area: Area): void {
    this.router.navigateByUrl(`/app/traceability/areas/${area.id}/machines`);
  }
}
