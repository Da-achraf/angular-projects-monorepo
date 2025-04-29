import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, map, pipe, switchMap, tap } from 'rxjs';
import { withAuth } from '../../../core/auth/data-access/auth.store';
import { IdeaStatus } from '../../../core/idea/models/idea-status.model';
import { Idea, IdeaUpdate } from '../../../core/idea/models/idea.model';
import {
  RatingMatrix,
  RatingMatrixCreate,
  RatingMatrixUpdate,
} from '../../../core/idea/models/rating-matrix.model';
import { IdeaService } from '../services/idea.service';
import { ApproveIdeaDialogComponent } from './components/approve-idea-dialog.component';
import { RejectIdeaDialogComponent } from './components/reject-idea-dialog.component';
import { RatingMatrixService } from './rating-matrix.service';

type IdeaReviewState = {
  ideaId: number;
  idea: Idea | undefined;
  ratingMatrixVisible: boolean;
};

const intitialIdeaReviewState: IdeaReviewState = {
  ideaId: 0,
  idea: undefined,
  ratingMatrixVisible: false,
};

export const IdeaReviewStore = signalStore(
  withState<IdeaReviewState>(intitialIdeaReviewState),

  withAuth(),

  withProps(() => ({
    ideaService: inject(IdeaService),
    ratingMatrixService: inject(RatingMatrixService),
    dialog: inject(MatDialog),
    destroyRef: inject(DestroyRef),
  })),

  withComputed(
    ({ idea, user, isCommitteeMember, connectedUserId, isTeoaMember }) => ({
      canApprove: computed(() => isCommitteeMember() || isTeoaMember()),
      canReject: computed(() => isCommitteeMember() || isTeoaMember()),
      canRate: computed(() => isCommitteeMember()),

      /**
       * Here this boolean computed refers to whether
       * the connected user is the submitter of the idea.
       *
       * */
      isIdeaSubmitter: computed(() => user.id() === idea()?.submitter.id),

      /**
       * Here this boolean computed refers to whether
       * the connected user is an owner of the idea.
       *
       * */
      isOwner: computed(
        () =>
          !!idea()?.assignment?.assignees?.some(a => a.id === connectedUserId())
      ),

      // whether the idea has already a rating or not
      isRated: computed(() => !!idea()?.rating_matrix),
      rating: computed(() => idea()?.rating_matrix?.total_score),
    })
  ),

  // Loading states
  withComputed(({ loadingStates }) => ({
    isLoading: computed(() => loadingStates()['load'] || false),
    isApprovingIdea: computed(() => loadingStates()['approve-idea'] || false),
    isRatingIdea: computed(() => loadingStates()['rate-idea'] || false),
    isRejectingIdea: computed(() => loadingStates()['reject-idea'] || false),
  })),

  withMethods(
    ({
      ideaId,
      ideaService,
      startLoading,
      stopLoading,
      dialog,
      destroyRef,
      _showSuccess,
      _showError,
      ...store
    }) => ({
      _showDialog: (component: any, action: () => Promise<void>) => {
        dialog
          .open(component, {
            data: { ideaId: ideaId() },
            minWidth: '40vw',
            maxHeight: '95vh',
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: async (res: { type: 'confirm' | 'cancel' }) => {
              if (res?.type === 'confirm') {
                await action();
              }
            },
          });
      },

      rejectIdea: async () => {
        const body: Partial<IdeaUpdate> = {
          id: ideaId(),
          status: IdeaStatus.REJECTED,
          action: 'rejected',
        };

        startLoading('reject-idea');
        try {
          const response = await ideaService.updateIdea(body);
          patchState(store, { idea: response.data as Idea });
          _showSuccess('Idea rejected succesfully');
        } catch {
          _showError('Error rejecting this idea');
        } finally {
          stopLoading('reject-idea');
        }
      },

      approveIdea: async () => {
        const body: Partial<IdeaUpdate> = {
          id: ideaId(),
          status: IdeaStatus.APPROVED,
          action: 'approved',
        };

        startLoading('approve-idea');
        try {
          const response = await ideaService.updateIdea(body);
          patchState(store, { idea: response.data as Idea });
          _showSuccess('Idea approved succesfully');
        } catch {
          _showError('Error approving this idea');
        } finally {
          stopLoading('approve-idea');
        }
      },

      setRatingMatrixVisibility: (value: boolean) => {
        patchState(store, {
          ratingMatrixVisible: value,
        });
      },
    })
  ),

  withMethods(
    ({
      ideaService,
      ratingMatrixService,
      router,
      dialog,
      destroyRef,
      startLoading,
      stopLoading,
      _showSuccess,
      _showWarning,
      _showError,
      connectedUserId,
      ideaId,
      approveIdea,
      rejectIdea,
      _showDialog,
      setRatingMatrixVisibility,
      ...store
    }) => ({
      _loadIdea: rxMethod<number>(
        pipe(
          tap(_ => startLoading('load')),
          tap(id => console.log('loading idea: ', id)),
          filter(id => id != 0),
          switchMap(id =>
            ideaService.loadOne(id).pipe(
              map(resp => resp.data as Idea),
              tapResponse({
                next: idea => patchState(store, { idea }),
                error: () => {
                  router.navigate(['/app/ideas/list']);
                  _showWarning(
                    'Failed to load idea. Redirecting to ideas list..'
                  );
                },
                finalize: () => stopLoading('load'),
              })
            )
          )
        )
      ),

      rateIdea: rxMethod<RatingMatrixCreate>(
        pipe(
          tap(_ => startLoading('rate-idea')),
          switchMap(body =>
            ratingMatrixService.save(body).pipe(
              tapResponse({
                next: resp => {
                  patchState(store, {
                    idea: {
                      ...(store.idea() as Idea),
                      rating_matrix: resp.data as RatingMatrix,
                    },
                  });

                  _showSuccess('Rated successfully.');
                  setRatingMatrixVisibility(false);
                },
                error: err => _showError('Error rating the idea.'),
                finalize: () => stopLoading('rate-idea'),
              })
            )
          )
        )
      ),

      updateIdea: rxMethod<Partial<IdeaUpdate>>(
        pipe(
          switchMap(body =>
            ideaService.update(body).pipe(
              tapResponse({
                next: resp => {
                  patchState(store, {
                    idea: resp.data as Idea,
                  });
                },
                error: err => console.log,
              })
            )
          )
        )
      ),

      updateIdeaRating: rxMethod<RatingMatrixUpdate>(
        pipe(
          tap(_ => startLoading('rate-idea')),
          switchMap(body =>
            ratingMatrixService.update(body).pipe(
              tapResponse({
                next: resp => {
                  patchState(store, {
                    idea: {
                      ...(store.idea() as Idea),
                      rating_matrix: resp.data as RatingMatrix,
                    },
                  });

                  _showSuccess('Rating updated successfully.');
                  setRatingMatrixVisibility(false);
                },
                error: err => _showError('Error updating the rating.'),
                finalize: () => stopLoading('rate-idea'),
              })
            )
          )
        )
      ),

      showRejectDialog: async () => {
        _showDialog(RejectIdeaDialogComponent, rejectIdea);
      },

      showApproveDialog: async () => {
        _showDialog(ApproveIdeaDialogComponent, approveIdea);
      },

      setIdeaId: (ideaId: number) => {
        patchState(store, { ideaId });
      },
    })
  ),

  withMethods(({ _loadIdea, ideaId }) => ({
    reloadIdea: () => _loadIdea(ideaId()),
  })),

  withHooks(({ ideaId, _loadIdea }) => ({
    onInit() {
      _loadIdea(ideaId);
    },
  }))
);
