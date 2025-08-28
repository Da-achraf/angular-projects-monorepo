import { Component, inject } from '@angular/core';
import { PopoverModule } from 'primeng/popover';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { DashboardFilterComponent } from 'projects/e-suggestion/src/app/pattern/dashboard-filter/dashboard-filter/dashboard-filter.component';
import { FilterButtonComponent } from 'projects/e-suggestion/src/app/ui/components/filter-button/filter-button.component';
import { ScoreCardComponent } from '../score-card.component';
import { ScoreCardService } from '../score-cards.service';
import { ScoreCardStore } from '../score-cards.store';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ba/core/data-access';
@Component({
  selector: 'ba-score-cards-list',
  templateUrl: 'score-cards-list.component.html',
  imports: [
    ScoreCardComponent,
    DashboardFilterComponent,
    PopoverModule,
    FilterButtonComponent,
    NgClass,
   TranslatePipe
  ],
  providers: [ScoreCardStore, ScoreCardService],
})
export class ScoreCardsListComponent {
  protected readonly store = inject(ScoreCardStore);

  onFilter(filter: QueryParamType) {
    this.store.setQueryParams(filter);
  }
}
