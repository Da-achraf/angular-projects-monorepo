import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Idea } from 'projects/e-suggestion/src/app/core/idea/models/idea.model';
import { IdeaStatusBadgeComponent } from 'projects/e-suggestion/src/app/pattern/idea-status/components/idea-status-badge.component';
import { RatingScoreComponent } from 'projects/e-suggestion/src/app/ui/components/rating-mark.component';

@Component({
  selector: 'ba-idea-caption',
  template: `
    @if (idea(); as idea) {
      <div class="flex items-center gap-x-3">
        <i class="fa-solid fa-circle-info text-secondary"></i>
        <p class="text-lg font-semibold text-gray-500">
          <ng-content></ng-content>
          with Id {{ idea.id }}
        </p>

        <span class="text-lg font-semibold text-gray-300">-</span>

        <ba-idea-status [status]="idea.status" />

        @if (idea?.rating_matrix; as matrix) {
          <span class="text-lg font-semibold text-gray-300">-</span>
          <ba-rating-score [score]="matrix.total_score" />
        }
      </div>
    }
  `,
  imports: [RatingScoreComponent, IdeaStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeaCaptionComponent {
  idea = input.required<Idea>();
}
