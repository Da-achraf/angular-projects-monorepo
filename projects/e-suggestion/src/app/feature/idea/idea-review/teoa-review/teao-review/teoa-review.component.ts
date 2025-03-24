import { Component, effect, inject, input, untracked } from '@angular/core';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { TeoaReviewStore } from '../teoa-review.store';
import { TeoaCommentsComponent } from '../teoa-comments/teao-comments-list/teoa-comments.component';
import { TeoaReviewNotInitializedComponent } from './teoa-review-not-initialized.component';
import { TeoaReview } from 'projects/e-suggestion/src/app/core/idea/models/teoa-review.model';
import { TeoaReviewService } from '../teoa-review.service';

@Component({
  selector: 'ba-teoa-review',
  templateUrl: 'teoa-review.component.html',
  styleUrl: 'teoa-review.component.scss',
  imports: [
    BaButtonComponent,
    TeoaCommentsComponent,
    TeoaReviewNotInitializedComponent,
  ],
  providers: [TeoaReviewService, TeoaReviewStore],
})
export class TeoaReviewComponent {
  protected readonly store = inject(TeoaReviewStore);
  
  ideaId = input.required<number>();
  teoaReview = input<TeoaReview>()

  private readonly teoaReviewEffect = effect(() => {
    const review = this.teoaReview();
    if (!review) return;

    untracked(() => this.store.setTeoaReview(review));
  });
}
