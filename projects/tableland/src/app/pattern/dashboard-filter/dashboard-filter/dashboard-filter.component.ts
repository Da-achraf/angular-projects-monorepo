import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslationService } from '@ba/core/data-access';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { QueryParamType } from '../../../core/api/api.model';
import { BU } from '../../../core/crud/bus/bu.model';
import { Department } from '../../../core/crud/departments/department.model';
import { Plant } from '../../../core/crud/plants/plant.model';
import { BaButtonComponent } from '../../../ui/components/button/button.component';
import { IdeaStatusBadgeComponent } from '../../idea-status/components/idea-status-badge.component';
import { DateFilterComponent } from '../date-filter/date-filter.component';

@Component({
  selector: 'ba-dashboard-filter',
  templateUrl: 'dashboard-filter.component.html',
  imports: [
    DateFilterComponent,
    DividerModule,
    FormsModule,
    BaButtonComponent,
    MultiSelectModule,
    FloatLabelModule,
    IdeaStatusBadgeComponent,
    TranslatePipe,
  ],
})
export class DashboardFilterComponent implements OnInit {
  protected translationService = inject(TranslationService);

  plants = input<Plant[] | null>(null);
  departments = input<Department[] | null>(null);
  bus = input<BU[] | null>(null);
  statuses = input<string[] | null>(null);

  protected selectedPlants: Plant[] = [];
  protected selectedBus: BU[] = [];
  protected selectedDepartments: Department[] = [];
  protected selectedStatuses: string[] = [];

  filterChanged = output<QueryParamType>();
  private params: QueryParamType = {};

  otherFiltersAvailable = computed(
    () => this.plants() || this.bus() || this.departments() || this.statuses()
  );

  ngOnInit(): void {
    this.applyFilters();
  }

  onDateFilter(filter: any) {
    this.params = {
      ...this.params,
      created_at__gte: filter.start,
      created_at__lte: filter.end,
    };
  }

  onPlantsChange() {
    this.params = {
      ...this.params,
      plants: this.selectedPlants.length
        ? this.selectedPlants.map(({ id }) => id).join(',')
        : null,
    };
  }

  onBusChange() {
    this.params = {
      ...this.params,
      bus: this.selectedBus.length
        ? this.selectedBus.map(({ id }) => id).join(',')
        : null,
    };
  }

  onDepartmentsChange() {
    this.params = {
      ...this.params,
      bus: this.selectedDepartments.length
        ? this.selectedDepartments.map(({ id }) => id).join(',')
        : null,
    };
  }

  onStatusChange() {
    this.params = {
      ...this.params,
      status__in: this.selectedStatuses.length
        ? this.selectedStatuses.join(',')
        : null,
    };
  }

  applyFilters() {
    this.filterChanged.emit(this.params);
  }
}
