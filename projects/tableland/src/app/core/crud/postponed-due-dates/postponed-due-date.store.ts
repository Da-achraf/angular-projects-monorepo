import { inject } from '@angular/core';
import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore, withProps, withState } from '@ngrx/signals';
import { MessageService } from 'primeng/api';
import {
  PostponedDueDate,
  PostponedDueDateCreate,
  PostponedDueDateUpdate,
} from './postponed-due-date.model';
import { PostponedDueDateService } from './postponed-due-date.service';

type PostponedDueDateState = {};
const intitialState: PostponedDueDateState = {};

export const PostponedDueDateStore = signalStore(
  { providedIn: 'root' },
  withState<PostponedDueDateState>(intitialState),
  withPagedEntities<
    PostponedDueDate,
    PostponedDueDateCreate,
    PostponedDueDateUpdate
  >(PostponedDueDateService),
  withSimpleEntities<PostponedDueDate>(PostponedDueDateService),

  withProps(() => ({
    messageService: inject(MessageService),
  }))
);
