import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { withAuth } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.store';
import { IdeaStatus } from 'projects/e-suggestion/src/app/core/idea/models/idea-status.model';
import { IdeaUpdate } from 'projects/e-suggestion/src/app/core/idea/models/idea.model';
import { TeoaReview } from 'projects/e-suggestion/src/app/core/idea/models/teoa-review.model';
import { ConfirmDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/confirm-dialog.component';
import { DeleteDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/delete-dialog.component';
import { lastValueFrom } from 'rxjs';
import { IdeaService } from '../../services/idea.service';
import { IdeaReviewStore } from '../idea-review.store';
import { TeoaReviewService } from './teoa-review.service';

// assi refers to assignment
type TeoaReviewState = {
  review: TeoaReview | undefined;
  isReviewDirty: boolean;
  tempData: any;
};

const teoaReviewState: TeoaReviewState = {
  review: undefined,
  isReviewDirty: false,
  tempData: undefined,
};

export const TeoaReviewStore = signalStore(
  withState<TeoaReviewState>(teoaReviewState),

  withAuth(),

  withProps(() => ({
    teoaReviewService: inject(TeoaReviewService),
    ideaService: inject(IdeaService),
    ideaReviewStore: inject(IdeaReviewStore),
    dialog: inject(MatDialog),
    destroyRef: inject(DestroyRef),
  })),

  withComputed(({ review }) => ({
    isReviewAvailable: computed(() => review() != undefined),
    reviewComments: computed(() => review()?.comments ?? []),
    reviewId: computed(() => review()?.id ?? 0),
  })),

  // LoggedIn user permissions on the teoa review
  withComputed(({ isTeoaMember, isReviewAvailable }) => ({
    canInitiate: computed(() => isTeoaMember() && !isReviewAvailable()),
    canDelete: computed(() => isTeoaMember() && isReviewAvailable()),
    canClose: computed(() => isTeoaMember() && isReviewAvailable()),
  })),

  // Loading states
  withComputed(({ loadingStates }) => ({
    isLoading: computed(() => loadingStates()['load'] || false),
    isInitiatingReview: computed(
      () => loadingStates()['initiate-review'] || false
    ),
    isSavingChanges: computed(() => loadingStates()['save-changes'] || false),
    isDeletingReview: computed(() => loadingStates()['delete-review'] || false),
  })),

  withMethods(
    ({
      startLoading,
      stopLoading,
      dialog,
      destroyRef,
      teoaReviewService,
      ideaService,
      ideaReviewStore,
      _showError,
      _showSuccess,
      ...store
    }) => ({
      _initiateReview: async (ideaId: number) => {
        try {
          // Start loading
          startLoading('initiate-review');

          // Filter out invalid ideaId
          if (ideaId === 0) {
            throw new Error('Invalid ideaId');
          }

          // Call the service and await the response
          const response = await lastValueFrom(
            teoaReviewService.initiateReview(ideaId)
          );

          patchState(store, { review: response.data as TeoaReview });
          _showSuccess('Teoa Review initiated successfully');
        } catch (error) {
          _showError('Error initiating the review');
          console.error(error);
        } finally {
          stopLoading('initiate-review');
        }
      },

      _CloseReview: async (ideaId: number) => {
        try {
          startLoading('close-review');

          const updateBody: Partial<IdeaUpdate> = {
            id: ideaId,
            status: IdeaStatus.CLOSED,
            closed_at: new Date().toISOString(),
          };

          // Update the idea
          ideaReviewStore.updateIdea(updateBody);

          // patchState(store, { review: response.data as TeoaReview });
          _showSuccess('Teoa Review closed successfully');
        } catch (error) {
          _showError('Error closing the teao review');
          console.error(error);
        } finally {
          stopLoading('close-review');
        }
      },

      _deleteReview: async (id: number) => {
        try {
          startLoading('delete-review');
          await lastValueFrom(teoaReviewService.deleteOne(id));
          patchState(store, { review: undefined });
          _showSuccess('Teoa review deleted successfully');
        } catch (error) {
          _showError('Error deleting the Teoa review');
          console.error(error);
        } finally {
          stopLoading('delete-review');
        }
      },
    })
  ),

  withMethods(
    ({
      router,
      startLoading,
      stopLoading,
      review,
      tempData,
      _initiateReview,
      _CloseReview,
      _deleteReview,
      dialog,
      destroyRef,
      _showSuccess,
      _showError,
      connectedUserId,
      teoaReviewService,
      reviewId,
      ...store
    }) => ({
      saveChanges: async () => {
        startLoading('save-changes');
        try {
          _showSuccess('Changes saved successfully.');
        } catch {
          _showError('Error occured while saving the changes.');
        } finally {
          stopLoading('save-changes');
        }
      },

      showInitiateReviewDialog: (ideaId: number) => {
        dialog
          .open(ConfirmDialogComponent, {
            minWidth: '40vw',
            maxHeight: '95vh',
            data: {
              header: 'initiate a TEOA review.',
            },
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: async (res: { type: 'confirm' | 'cancel' }) => {
              if (res?.type === 'confirm') {
                await _initiateReview(ideaId);
              }
            },
          });
      },

      showCloseReviewDialog: (ideaId: number) => {
        dialog
          .open(ConfirmDialogComponent, {
            minWidth: '40vw',
            maxHeight: '95vh',
            data: {
              header: "close this idea's review",
            },
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: async (res: { type: 'confirm' | 'cancel' }) => {
              if (res?.type === 'confirm') {
                await _CloseReview(ideaId);
              }
            },
          });
      },

      showDeleteReviewDialog: async () => {
        dialog
          .open(DeleteDialogComponent, {
            data: { label: 'teoa review' },
            minWidth: '40vw',
            maxHeight: '95vh',
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: async (res: any) => {
              if (res && res?.type === 'delete') {
                await _deleteReview(reviewId());
              }
            },
          });
      },

      setTeoaReview: (review: TeoaReview | undefined) => {
        patchState(store, { review });
      },

      setTempData: (newData: any) => {
        patchState(store, { tempData: { ...tempData(), ...newData } });
        patchState(store, { isReviewDirty: true });
      },
    })
  )
);
