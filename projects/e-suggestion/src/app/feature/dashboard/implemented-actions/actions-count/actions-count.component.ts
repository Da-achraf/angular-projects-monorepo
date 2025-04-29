import { NgClass } from '@angular/common';
import { Component, effect, inject, input, untracked } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { PopoverModule } from 'primeng/popover';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { DashboardFilterComponent } from 'projects/e-suggestion/src/app/pattern/dashboard-filter/dashboard-filter/dashboard-filter.component';
import { FilterButtonComponent } from 'projects/e-suggestion/src/app/ui/components/filter-button/filter-button.component';
import { ActionsCountService } from '../actions-count.service';
import { ActionsCountStore } from '../actions-count.store';

@Component({
  selector: 'ba-actions-count',
  templateUrl: 'actions-count.component.html',
  imports: [
    NgxEchartsDirective,
    DashboardFilterComponent,
    FilterButtonComponent,
    PopoverModule,
    NgClass,
  ],
  providers: [ActionsCountService, ActionsCountStore],
})
export class ActionsCountComponent {
  protected readonly store = inject(ActionsCountStore);

  departments = input.required<string[]>();

  departmentsEffect = effect(() => {
    const departments = this.departments();
    if (!departments.length) return;

    untracked(() => {
      this.store.setDepartments(departments);
    });
  });

  onFilter(filter: QueryParamType) {
    this.store.setQueryParams(filter);
  }
}
