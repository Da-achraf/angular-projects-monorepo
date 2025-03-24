import { inject, Injectable } from '@angular/core';
import { CrudBaseService } from 'projects/e-suggestion/src/app/core/crud/crud-base.service';

import { HttpClient } from '@angular/common/http';
import { Response } from '@ba/core/data-access';
import { API_URL } from '@ba/core/http-client';
import {
  AssignmentComment,
  AssignmentCommentCreate,
  AssignmentCommentUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/assignment-comment.model';

@Injectable()
export class AssignmentCommentService extends CrudBaseService<
  AssignmentComment,
  AssignmentCommentCreate,
  AssignmentCommentUpdate
> {
  constructor() {
    super('/assignments-comments');
  }

  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  loadCommentsByAssignmentId(assignmentId: number) {
    const queryParams = {
      assignment_id: assignmentId,
      page_size: 10000,
    };
    return this.http.get<Response<AssignmentComment>>(
      `${this.baseUrl}/assignments-comments`,
      {
        params: queryParams,
      }
    );
  }
}
