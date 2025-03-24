import { Component } from '@angular/core';
import { ScoreCardComponent } from "../score-card.component";
import { DateFilterComponent } from "../report-filter/date-filter.component";

@Component({
  selector: 'ba-score-cards-list',
  templateUrl: 'score-cards-list.component.html',
  imports: [ScoreCardComponent, DateFilterComponent],
})
export class ScoreCardsListComponent {}
