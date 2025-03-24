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
import { Comment } from 'projects/e-suggestion/src/app/core/idea/models/comment.model';
import { filter, map, pipe, switchMap, tap } from 'rxjs';
import { IdeaCommentService } from './idea-comment.service';

type CommentsState = {
  ideaId: number;
  sortingOrder: 'asc' | 'desc';
  filter: 'all' | 'only_yours' | 'only_others';
};

const intitialCommentsState: CommentsState = {
  ideaId: 0,
  sortingOrder: 'desc',
  filter: 'all',
};

export const IdeaCommentsStore = signalStore(
  withState<CommentsState>(intitialCommentsState),

  withAuth(),
  withEntities<Comment>(),

  withProps(() => ({
    commentService: inject(IdeaCommentService),
    destroyRef: inject(DestroyRef),
  })),

  // Apply sorting on comments
  withComputed(({ entities, sortingOrder }) => ({
    sortedComments: computed(() => {
      return entities()
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();

          return sortingOrder() === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }),
  })),

  withComputed(({ sortedComments, filter, connectedUserId }) => ({
    filteredComments: computed(() => {
      const f = filter();

      // Apply filtering logic based on the selected filter
      return sortedComments().filter(comment => {
        if (f === 'all') {
          return true;
        } else if (f === 'only_yours') {
          return comment.commenter.id === connectedUserId();
        } else if (f === 'only_others') {
          return comment.commenter.id !== connectedUserId();
        }
        return true;
      });
    }),
  })),

  // Loading states
  withComputed(({ loadingStates }) => ({
    isLoading: computed(() => loadingStates()['load'] || false),
    isAddingComment: computed(() => loadingStates()['add-comment'] || false),
    isDeletingComment: computed(
      () => loadingStates()['delete-comment'] || false
    ),
  })),

  // State setters
  withMethods(({ startLoading, stopLoading, ...store }) => ({
    setSortingOrder: (order: 'asc' | 'desc') => {
      patchState(store, { sortingOrder: order });
    },

    setFilter: (filter: string) => {
      patchState(store, {
        filter: filter as 'all' | 'only_yours' | 'only_others',
      });
    },

    setIdeaId: (ideaId: number) => patchState(store, { ideaId }),

    setComments: (comments: Comment[]) => {
      startLoading('load');
      patchState(store, setEntities(comments));
      stopLoading('load');
    },
  })),

  withMethods(
    ({
      commentService,
      connectedUserId,
      startLoading,
      stopLoading,
      _showSuccess,
      _showError,
      ideaId,
      ...store
    }) => ({
      _loadComments: rxMethod<number>(
        pipe(
          tap(_ => startLoading('load')),
          filter(ideaId => ideaId != 0),
          switchMap(id =>
            commentService.loadCommentsByIdeaId(id).pipe(
              map(resp => resp.content as Comment[]),
              tapResponse({
                next: comments => {
                  patchState(store, setEntities(comments));
                },
                error: () => console.error,
                finalize: () => stopLoading('load'),
              })
            )
          )
        )
      ),

      addComment: rxMethod<string>(
        pipe(
          tap(_ => startLoading('add-comment')),
          switchMap(body =>
            commentService
              .save({
                body,
                commenter_id: connectedUserId(),
                idea_id: ideaId(),
              })
              .pipe(
                tapResponse({
                  next: resp => {
                    patchState(store, addEntity(resp.data as Comment));
                    _showSuccess('Comment added successfully.');
                  },
                  error: err => _showError('Error creating the comment.'),
                  finalize: () => stopLoading('add-comment'),
                })
              )
          )
        )
      ),

      deleteComment: rxMethod<number>(
        pipe(
          tap(_ => startLoading('delete-comment')),
          switchMap(id =>
            commentService.deleteOne(id).pipe(
              tapResponse({
                next: resp => {
                  patchState(store, removeEntity(id));
                  _showSuccess('Comment deleted successfully.');
                },
                error: err => _showError('Error deleting the comment.'),
                finalize: () => stopLoading('delete-comment'),
              })
            )
          )
        )
      ),
    })
  )
);
