import { NgClass } from '@angular/common';
import { Component, effect, inject, input, untracked } from '@angular/core';
import { TranslatePipe } from '@ba/core/data-access';
import { NgxEchartsDirective } from 'ngx-echarts';
import { PopoverModule } from 'primeng/popover';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { Department } from 'projects/e-suggestion/src/app/core/crud/departments/department.model';
import { DashboardFilterComponent } from 'projects/e-suggestion/src/app/pattern/dashboard-filter/dashboard-filter/dashboard-filter.component';
import { FilterButtonComponent } from 'projects/e-suggestion/src/app/ui/components/filter-button/filter-button.component';
import { IdeasByDepartmentService } from '../ideas-by-department.service';
import { IdeasByDepartmentStore } from '../ideas-by-department.store';

@Component({
  selector: 'ba-ideas-by-department',
  templateUrl: 'ideas-by-department.component.html',
  imports: [
    NgxEchartsDirective,
    DashboardFilterComponent,
    PopoverModule,
    NgClass,
    TranslatePipe,
    FilterButtonComponent,
  ],
  providers: [IdeasByDepartmentService, IdeasByDepartmentStore],
})
export class IdeasByDepartmentsComponent {
  protected readonly store = inject(IdeasByDepartmentStore);

  departments = input.required<Department[]>();

  departmentsEffect = effect(() => {
    const departments = this.departments();
    if (!departments.length) return;

    untracked(() => {
      this.store.setDepartments(departments);
      // Only set selected departments if they're different
      // if (JSON.stringify(this.store.selectedDepartments()) !== JSON.stringify(departments)) {
      this.store.setSelectedDepartments(departments);
      // }
    });
  });

  onFilter(filter: QueryParamType) {
    const params: QueryParamType = {
      departments_ids: filter['departments'],
      ...filter,
    };
    this.store.setQueryParams(params);

    console.log('department filter: ', params);
  }
}
