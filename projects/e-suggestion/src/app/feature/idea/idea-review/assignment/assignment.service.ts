import { Injectable } from '@angular/core';
import { CrudBaseService } from 'projects/e-suggestion/src/app/core/crud/crud-base.service';

import {
  Assignment,
  AssignmentCreate,
  AssignmentUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/assignment.model';
@Injectable()
export class AssignmentService extends CrudBaseService<
  Assignment,
  AssignmentCreate,
  AssignmentUpdate
> {
  constructor() {
    super('/assignments');
  }

  initiateAssignment(ideaId: number) {
    return this.apiService.post<Assignment, { idea_id: number }>(
      `/assignments`,
      { idea_id: ideaId }
    );
  }
}
