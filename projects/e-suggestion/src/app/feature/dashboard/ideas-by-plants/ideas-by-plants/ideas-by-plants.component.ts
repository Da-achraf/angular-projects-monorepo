import { NgClass } from '@angular/common';
import { Component, effect, inject, input, untracked } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { PopoverModule } from 'primeng/popover';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { Plant } from 'projects/e-suggestion/src/app/core/crud/plants/plant.model';
import { DashboardFilterComponent } from 'projects/e-suggestion/src/app/pattern/dashboard-filter/dashboard-filter/dashboard-filter.component';
import { FilterButtonComponent } from 'projects/e-suggestion/src/app/ui/components/filter-button/filter-button.component';
import { IdeasByPlantService } from '../ideas-by-plants.service';
import { IdeasByPlantStore } from '../ideas-by-plants.store';

@Component({
  selector: 'ba-ideas-by-plants',
  templateUrl: 'ideas-by-plants.component.html',
  imports: [
    NgxEchartsDirective,
    DashboardFilterComponent,
    FilterButtonComponent,
    PopoverModule,
    NgClass,
  ],
  providers: [IdeasByPlantService, IdeasByPlantStore],
})
export class IdeasByPlantsComponent {
  protected readonly store = inject(IdeasByPlantStore);

  plants = input.required<Plant[]>();

  plantsEffect = effect(() => {
    const plants = this.plants();
    if (!plants.length) return;

    untracked(() => {
      this.store.setPlants(plants);
      // Only set selected plants if they're different
      if (
        JSON.stringify(this.store.selectedPlants()) !== JSON.stringify(plants)
      ) {
        this.store.setSelectedPlants(plants);
      }
    });
  });

  onFilter(filter: QueryParamType) {
    const params: QueryParamType = {
      plants_ids: filter['plants'],
      ...filter,
    };
    this.store.setQueryParams(params);
  }
}
