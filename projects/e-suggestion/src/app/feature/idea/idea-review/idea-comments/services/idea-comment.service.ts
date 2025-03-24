import { inject, Injectable } from '@angular/core';
import { CrudBaseService } from 'projects/e-suggestion/src/app/core/crud/crud-base.service';

import { Response } from '@ba/core/data-access';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '@ba/core/http-client';
import {
  Comment,
  CommentCreate,
  CommentUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/comment.model';

@Injectable()
export class IdeaCommentService extends CrudBaseService<
  Comment,
  CommentCreate,
  CommentUpdate
> {
  constructor() {
    super('/comments');
  }

  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  loadCommentsByIdeaId(ideaId: number) {
    const queryParams = {
      idea_id: ideaId,
      page_size: 10000,
    };
    return this.http.get<Response<Comment>>(`${this.baseUrl}/comments`, {
      params: queryParams,
    });
  }
}
