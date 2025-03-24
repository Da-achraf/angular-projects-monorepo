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
import { TeoaComment } from 'projects/e-suggestion/src/app/core/idea/models/teoa-comment.model';
import { pipe, switchMap, tap } from 'rxjs';
import { TeoaCommentService } from './teoa-comment.service';

type TeoaCommentState = {
  reviewId: number; // Teoa review id
  sortingOrder: 'asc' | 'desc';
};

const intitialState: TeoaCommentState = {
  reviewId: 0,
  sortingOrder: 'desc',
};

export const TeoaCommentStore = signalStore(
  withState<TeoaCommentState>(intitialState),

  withAuth(),
  withEntities<TeoaComment>(),

  withProps(() => ({
    commentService: inject(TeoaCommentService),
    destroyRef: inject(DestroyRef),
  })),

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

  /**
   * The computed comments is the result of of operations
   * on brute comments entities (sorting, filterin if any...)
   */
  withComputed(({ _sortedComments }) => ({
    comments: computed(() => _sortedComments()),
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
      reviewId,
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
                teoa_review_id: reviewId(),
              })
              .pipe(
                tapResponse({
                  next: (resp) => {
                    patchState(store, addEntity(resp.data as TeoaComment));
                    _showSuccess('Comment added successfully.');
                  },
                  error: () => _showError('Error creating the comment.'),
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
                error: (err) => _showError('Error deleting the comment.'),
                finalize: () => stopLoading('delete-comment'),
              })
            )
          )
        )
      ),

      setSortingOrder: (order: 'asc' | 'desc') => {
        patchState(store, { sortingOrder: order });
      },

      setTeoaReviewId: (reviewId: number) => patchState(store, { reviewId }),

      setComments: (comments: TeoaComment[]) => {
        startLoading('load');
        patchState(store, setEntities(comments));
        stopLoading('load');
      },
    })
  )
);
