import { inject, Injectable } from '@angular/core';
import { CrudBaseService } from 'projects/e-suggestion/src/app/core/crud/crud-base.service';

import { HttpClient } from '@angular/common/http';
import { Response } from '@ba/core/data-access';
import { API_URL } from '@ba/core/http-client';
import { AssignmentComment } from 'projects/e-suggestion/src/app/core/idea/models/assignment-comment.model';
import {
  TeoaComment,
  TeoaCommentCreate,
  TeoaCommentUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/teoa-comment.model';

@Injectable()
export class TeoaCommentService extends CrudBaseService<
  TeoaComment,
  TeoaCommentCreate,
  TeoaCommentUpdate
> {
  constructor() {
    super('/teoa-comments');
  }

  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  loadCommentsByTeoaReviewId(reviewId: number) {
    const queryParams = {
      teoa_review_id: reviewId,
      page_size: 10000,
    };
    return this.http.get<Response<AssignmentComment>>(
      `${this.baseUrl}/teoa-comments`,
      {
        params: queryParams,
      }
    );
  }
}
