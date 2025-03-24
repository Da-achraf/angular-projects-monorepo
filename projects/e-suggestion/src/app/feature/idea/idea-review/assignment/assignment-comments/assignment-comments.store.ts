import { computed, DestroyRef, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withAuth } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.store';
import { AssignmentComment } from 'projects/e-suggestion/src/app/core/idea/models/assignment-comment.model';
import { pipe, switchMap, tap } from 'rxjs';
import { AssignmentStore } from '../assignment.store';
import { AssignmentCommentService } from './assignment-comments.service';

type CommentsState = {
  assignmentId: number;
  sortingOrder: 'asc' | 'desc';
  filter: 'all' | 'only_yours' | 'only_others' | 'owner';
};

const intitialState: CommentsState = {
  assignmentId: 0,
  sortingOrder: 'desc',
  filter: 'all',
};

export const AssignmentCommentsStore = signalStore(
  withState<CommentsState>(intitialState),

  withAuth(),

  withEntities<AssignmentComment>(),

  withProps(() => ({
    commentService: inject(AssignmentCommentService),
    assignmentStore: inject(AssignmentStore),
    destroyRef: inject(DestroyRef),
  })),

  // Sort comments
  withComputed(({ entities, sortingOrder }) => ({
    _sortedComments: computed(() =>
      entities()
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();

          return sortingOrder() === 'asc' ? dateA - dateB : dateB - dateA;
        })
    ),
  })),

  withComputed(
    ({ _sortedComments, assignmentStore, connectedUserId, filter }) => ({
      _filteredComments: computed(() => {
        const f = filter();

        // Apply filtering logic based on the selected filter
        return _sortedComments().filter((comment) => {
          if (f === 'all') {
            return true;
          } else if (f === 'only_yours') {
            return comment.commenter.id === connectedUserId();
          } else if (f === 'only_others') {
            return comment.commenter.id !== connectedUserId();
          } else if (f === 'owner') {
            const assigneesIds = assignmentStore.assignees()?.map((a) => a.id);
            return assigneesIds?.some((id) => id === comment.commenter.id);
          }
          return true;
        });
      }),
    })
  ),
  /**
   * The computed comments is the result of of operations
   * on brute comments entities (sorting, filterin if any...)
   */
  withComputed(({ _filteredComments }) => ({
    comments: computed(() => _filteredComments()),
  })),

  // Loading states
  withComputed(({ loadingStates }) => ({
    isLoading: computed(() => loadingStates()['load'] || false),
    isAddingComment: computed(() => loadingStates()['add-comment'] || false),
    isDeletingComment: computed(
      () => loadingStates()['delete-comment'] || false
    ),
  })),

  withMethods(
    ({
      commentService,
      router,
      destroyRef,
      connectedUserId,
      startLoading,
      stopLoading,
      _showSuccess,
      _showError,
      assignmentId,
      entities,
      ...store
    }) => ({
      addComment: rxMethod<string>(
        pipe(
          tap((_) => startLoading('add-comment')),
          switchMap((body) =>
            commentService
              .save({
                body,
                commenter_id: connectedUserId(),
                assignment_id: assignmentId(),
              })
              .pipe(
                tapResponse({
                  next: (resp) => {
                    patchState(
                      store,
                      addEntity(resp.data as AssignmentComment)
                    );
                    _showSuccess('Comment added successfully.');
                  },
                  error: (err) => _showError('Error creating the comment.'),
                  finalize: () => stopLoading('add-comment'),
                })
              )
          )
        )
      ),

      deleteComment: rxMethod<number>(
        pipe(
          tap((_) => startLoading('delete-comment')),
          switchMap((id) =>
            commentService.deleteOne(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, removeEntity(id));
                  _showSuccess('Comment deleted successfully.');
                },
                error: () => _showError('Error deleting the comment.'),
                finalize: () => stopLoading('delete-comment'),
              })
            )
          )
        )
      ),

      setSortingOrder: (order: 'asc' | 'desc') => {
        patchState(store, { sortingOrder: order });
      },

      setFilter: (filter: string) => {
        patchState(store, {
          filter: filter as 'all' | 'only_yours' | 'only_others' | 'owner',
        });
      },

      setAssignmentId: (assignmentId: number) =>
        patchState(store, { assignmentId }),

      setComments: (comments: AssignmentComment[]) => {
        startLoading('load');
        patchState(store, setEntities(comments));
        stopLoading('load');
      },
    })
  )
);
