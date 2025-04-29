import { Component, input } from '@angular/core';
import { CountUpDirective } from '../directives/count-up/count-up.directive';

@Component({
  selector: 'ba-rating-score',
  template: `
    <div
      dir="ltr"
      class="flex items-center w-fit gap-x-3 text-sm font-bold shadow shadow-emerald-400 rounded-md px-3 py-2 bg-emerald-100 text-emerald-800"
    >
      <span  [countUp]="score()">{{ score() }}</span>
      <i class="fa-solid fa-star"></i>
    </div>
  `,
  standalone: true,
  imports: [CountUpDirective]
})
export class RatingScoreComponent {
  score = input.required<number>();
}
