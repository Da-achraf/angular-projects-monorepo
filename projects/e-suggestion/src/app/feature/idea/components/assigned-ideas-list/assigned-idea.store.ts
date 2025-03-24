import { computed, DestroyRef, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { withPagedEntities } from '@ba/core/data-access';
import { signalStore, withComputed, withProps } from '@ngrx/signals';
import { withAuth } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.store';
import {
  Idea,
  IdeaCreate,
  IdeaUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/idea.model';
import { IdeaService } from '../../services/idea.service';

export const AssignedIdeaStore = signalStore(
  withPagedEntities<Idea, IdeaCreate, IdeaUpdate>(IdeaService),

  withAuth(),

  withProps(() => ({
    ideaService: inject(IdeaService),
    router: inject(Router),
    dialog: inject(MatDialog),
    destroyRef: inject(DestroyRef),
  })),

  withComputed(({ entities, user }) => ({
    ideasCount: computed(() => entities().length),
    _userId: computed(() => user.id()),
  })),

  /**
   * Users permissions on ideas.
   *
   */
  withComputed(() => ({
    withIdeaViewDetail: computed(() => true),
    withIdeaExport: computed(() => false),
    withIdeaReview: computed(() => true),
  }))
);

export type AssignedIdeaStoreType = InstanceType<typeof AssignedIdeaStore>;
