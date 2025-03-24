import { Injectable } from '@angular/core';
import { CrudBaseService } from 'projects/e-suggestion/src/app/core/crud/crud-base.service';
import {
  TeoaReview,
  TeoaReviewCreate,
  TeoaReviewUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/teoa-review.model';


@Injectable()
export class TeoaReviewService extends CrudBaseService<
  TeoaReview,
  TeoaReviewCreate,
  TeoaReviewUpdate
> {
  constructor() {
    super('/teoa-reviews');
  }

  initiateReview(ideaId: number) {
    return this.apiService.post<TeoaReview, { idea_id: number }>(
      `/teoa-reviews`,
      { idea_id: ideaId }
    );
  }
}
