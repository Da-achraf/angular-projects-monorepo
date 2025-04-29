import { NgClass } from '@angular/common';
import { Component, effect, inject, input, untracked } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { PopoverModule } from 'primeng/popover';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { BU } from 'projects/e-suggestion/src/app/core/crud/bus/bu.model';
import { DashboardFilterComponent } from 'projects/e-suggestion/src/app/pattern/dashboard-filter/dashboard-filter/dashboard-filter.component';
import { FilterButtonComponent } from 'projects/e-suggestion/src/app/ui/components/filter-button/filter-button.component';

@Component({
  selector: 'ba-ideas-by-bus',
  templateUrl: 'ideas-by-bus.component.html',
  imports: [
    NgxEchartsDirective,
    DashboardFilterComponent,
    FilterButtonComponent,
    PopoverModule,
    NgClass,
  ],
  providers: [,],
})
export class IdeasByBusComponent {
  protected readonly store = inject(IdeasByBuStore);

  bus = input.required<BU[]>();

  busEffect = effect(() => {
    const bus = this.bus();
    if (!bus.length) return;

    untracked(() => {
      this.store.setPlants(bus);
      // Only set selected bus if they're different
      if (
        JSON.stringify(this.store.selectedPlants()) !== JSON.stringify(bus)
      ) {
        this.store.setSelectedPlants(bus);
      }
    });
  });

  onFilter(filter: QueryParamType) {
    const params: QueryParamType = {
      bus_ids: filter['bus'],
      ...filter,
    };
    console.log('onFilter....');
    this.store.setQueryParams(params);
  }
}
