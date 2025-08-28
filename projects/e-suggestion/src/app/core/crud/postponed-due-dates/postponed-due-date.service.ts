import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import {
  PostponedDueDate,
  PostponedDueDateCreate,
  PostponedDueDateUpdate,
} from './postponed-due-date.model';

@Injectable({
  providedIn: 'root',
})
export class PostponedDueDateService extends CrudBaseService<
  PostponedDueDate,
  PostponedDueDateCreate,
  PostponedDueDateUpdate
> {
  constructor() {
    super('/postponed-due-dates');
  }
}
