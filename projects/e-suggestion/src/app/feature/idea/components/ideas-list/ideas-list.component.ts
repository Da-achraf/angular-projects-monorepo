import { TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ba/core/data-access';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { AuthStore } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.store';
import { Idea } from 'projects/e-suggestion/src/app/core/idea/models/idea.model';
import { RadioFilterComponent } from 'projects/e-suggestion/src/app/pattern/radio-filter/radio.filter.component';
import { FilterOption } from 'projects/e-suggestion/src/app/pattern/radio-filter/types';
import { GenericTableComponent } from 'projects/e-suggestion/src/app/ui/components/table/generic-table.component';
import {
  SortEvnt,
  TableColumn,
} from 'projects/e-suggestion/src/app/ui/components/table/table-types.interface';
import { TruncatePipe } from 'projects/e-suggestion/src/app/ui/pipes/truncate.pipe';
import { IdeaStatusBadgeComponent } from '../../../../pattern/idea-status/components/idea-status-badge.component';
import { IdeaStore } from '../../services/idea.store';
import { loadIdeaInitialQueryParams } from '../../services/idea.util';
import { COLUMNS, GLOBAL_FILTER_FIELDS } from './const';

const Options: FilterOption[] = [
  {
    label: 'ideas-filter-all',
    value: 'all',
    title: 'ideas-filter-all-title',
  },
  {
    label: 'ideas-filter-yours',
    value: 'only_yours',
    title: 'ideas-filter-yours-title',
  },
  {
    label: 'ideas-filter-others',
    value: 'only_others',
    title: 'ideas-filter-others-title',
  },
];

@Component({
  selector: 'ba-ideas-list',
  templateUrl: './ideas-list.component.html',
  imports: [
    GenericTableComponent,
    TitleCasePipe,
    MenuModule,
    ButtonModule,
    IdeaStatusBadgeComponent,
    DropdownModule,
    FormsModule,
    TableModule,
    TitleCasePipe,
    TranslatePipe,
    MatTooltipModule,
    RadioFilterComponent,
    TruncatePipe,
  ],
})
export class IdeasListComponent {
  protected readonly store = inject(IdeaStore);
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected columns = signal<TableColumn[]>(COLUMNS).asReadonly();
  protected globalFilterFields = signal(GLOBAL_FILTER_FIELDS).asReadonly();

  protected readonly ideasFilterOptions = Options;

  // initial query params
  protected initialQueryParams = computed(() => {
    const loggedInUser = this.authStore.user();
    if (!loggedInUser.id) return;

    return loadIdeaInitialQueryParams(loggedInUser);
  });

  private queryParamsEffect = effect(() => {
    const initialQueryParams = this.initialQueryParams();
    if (!initialQueryParams) return;

    untracked(() =>
      this.store.initializeQueryParams({
        ...initialQueryParams,
      })
    );
  });

  onCreate() {
    this.router.navigate(['/app/ideas/create']);
  }

  onEdit(id: number) {
    this.router.navigate([`/app/ideas/${id}/edit`]);
  }

  onView(id: number) {
    this.router.navigate([`/app/ideas/${id}/detail`]);
  }

  onReview(id: number) {
    this.router.navigate([`/app/ideas/${id}/review`]);
  }

  onFilter(filter: QueryParamType | null) {
    if (filter === null) {
      this.store.resetQueryParams();
      return;
    }

    this.store.setQueryParams(filter);
  }

  onSort(event: SortEvnt) {
    this.store.setQueryParams({ [event.field]: event.value });
  }

  isIdeaOwner(idea: Idea, userId: number) {
    return idea.submitter.id === userId;
  }
}
