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
import {
  Assignment,
  AssignmentUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/assignment.model';
import {
  IdeaStatus,
  IdeaStatusType,
} from 'projects/e-suggestion/src/app/core/idea/models/idea-status.model';
import { IdeaUpdate } from 'projects/e-suggestion/src/app/core/idea/models/idea.model';
import { ConfirmDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/confirm-dialog.component';
import { DeleteDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/delete-dialog.component';
import { lastValueFrom } from 'rxjs';
import { IdeaReviewStore } from '../idea-review.store';
import { AssignmentService } from './assignment.service';

/**
 * Idea's Statuses when the assignees are not allowed to
 * update the implementation progress.
 */
const NonUpdatableStatuses = [
  IdeaStatus.CREATED,
  IdeaStatus.REJECTED,
  IdeaStatus.APPROVED,
  IdeaStatus.CLOSED,
];

// assi refers to assignment
type AssignmentState = {
  assignment: Assignment | undefined;
  /**
   * This temp data is used to store the changes the user made
   *  to save them later or not depending on user action
   */
  tempData: any;
};

const intitialAssignmentState: AssignmentState = {
  assignment: undefined,
  tempData: undefined,
};

export const AssignmentStore = signalStore(
  withState<AssignmentState>(intitialAssignmentState),

  withAuth(),

  withProps(() => ({
    assiService: inject(AssignmentService),
    dialog: inject(MatDialog),
    destroyRef: inject(DestroyRef),

    isOwner: inject(IdeaReviewStore).isOwner,

    ideaId: inject(IdeaReviewStore).ideaId,
    idea: inject(IdeaReviewStore).idea,
    reloadIdea: inject(IdeaReviewStore).reloadIdea,
    updateIdea: inject(IdeaReviewStore).updateIdea,
  })),

  // Assignment info
  withComputed(({ assignment, tempData }) => ({
    assignmentId: computed(() => assignment()?.id ?? 0),
    assignmentComments: computed(() => assignment()?.comments ?? []),
    assignees: computed(() => assignment()?.assignees),
    isAssignmentAvailable: computed(() => assignment() != undefined),
    isAssignmentDirty: computed(() => tempData() != undefined),
  })),

  withComputed(({ assignees, tempData }) => ({
    _ideaHasAssignees: computed(
      () => assignees()?.length != 0 || tempData()?.assignees?.length != 0
    ),
  })),

  // Permissions on assignment
  withComputed(
    ({
      idea,
      isCommitteeMember,
      isOwner,
      isAssignmentAvailable,
      _ideaHasAssignees,
    }) => ({
      canInitiate: computed(
        () => isCommitteeMember() && !isAssignmentAvailable()
      ),
      canSaveChanges: computed(
        () => isAssignmentAvailable() && (isCommitteeMember() || isOwner())
      ),
      canSetAssignees: computed(() => isCommitteeMember()),
      canSetDueDate: computed(
        () => (isCommitteeMember() || isOwner()) && _ideaHasAssignees()
      ),
      canSetProgress: computed(
        () =>
          isOwner() &&
          _ideaHasAssignees() &&
          NonUpdatableStatuses.some(s => idea()?.status != s)
      ),
      canDelete: computed(() => isCommitteeMember() && isAssignmentAvailable()),
    })
  ),

  // Loading states
  withComputed(({ loadingStates }) => ({
    isLoading: computed(() => loadingStates()['load'] || false),
    isInitiatingAssignment: computed(
      () => loadingStates()['initiate-assi'] || false
    ),
    isSavingChanges: computed(() => loadingStates()['save-changes'] || false),
    isDeletingAssignment: computed(
      () => loadingStates()['delete-assi'] || false
    ),
  })),

  // State setters
  withMethods(({ tempData, ...store }) => ({
    setAssignment: (assi: Assignment | undefined) => {
      patchState(store, { assignment: assi });
    },

    setTempData: (newData: any) => {
      patchState(store, { tempData: { ...tempData(), ...newData } });
    },
  })),

  // Dialog actions methods
  withMethods(
    ({
      startLoading,
      stopLoading,
      assiService,
      ideaId,
      updateIdea,
      _showError,
      _showSuccess,
      ...store
    }) => ({
      initiateAssignment: async (ideaId: number) => {
        try {
          // Start loading
          startLoading('initiate-assi');

          // Filter out invalid ideaId
          if (ideaId === 0) {
            throw new Error('Invalid ideaId');
          }

          // Call the service and await the response
          const response = await lastValueFrom(
            assiService.initiateAssignment(ideaId)
          );

          patchState(store, { assignment: response.data as Assignment });
          _showSuccess('Assignment initiated successfully');
        } catch (error) {
          _showError('Error initiating the assignment');
          console.error(error);
        } finally {
          stopLoading('initiate-assi');
        }
      },

      _deleteAssignment: async (id: number) => {
        try {
          // Start loading
          startLoading('delete-assi');

          await lastValueFrom(assiService.deleteOne(id));

          // Reset idea status
          const ideaBody: Partial<IdeaUpdate> = {
            id: ideaId(),
            status: IdeaStatus.APPROVED,
          };
          updateIdea(ideaBody);

          patchState(store, { assignment: undefined });
          _showSuccess('Assignment deleted successfully');
        } catch (error) {
          _showError('Error deleting the assignment');
          console.error(error);
        } finally {
          stopLoading('delete-assi');
        }
      },
    })
  ),

  // Dialogs methods
  withMethods(
    ({
      dialog,
      destroyRef,
      assignmentId,
      tempData,
      setTempData,
      initiateAssignment,
      _deleteAssignment,
    }) => ({
      showInitiateAssignmentDialog: (ideaId: number) => {
        dialog
          .open(ConfirmDialogComponent, {
            minWidth: '40vw',
            maxHeight: '95vh',
            data: {
              header: 'initiate an assignment',
            },
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: async (res: { type: 'confirm' | 'cancel' }) => {
              if (res?.type === 'confirm') {
                await initiateAssignment(ideaId);
              }
            },
          });
      },

      showDeleteAssignmentDialog: async () => {
        dialog
          .open(DeleteDialogComponent, {
            data: { label: 'assignment' },
            minWidth: '40vw',
            maxHeight: '95vh',
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: async (res: any) => {
              if (res && res?.type === 'delete') {
                await _deleteAssignment(assignmentId());
              }
            },
          });
      },

      /**
       * This dialog is shown when the user (committee member) changes
       * the assignnees of the idea.
       * It's goal is to cofirm that the user want to change the status
       * of the idea to 'Assigned' or keep the current status.
       */
      showIdeaStatusConfirmationDialog: () => {
        dialog
          .open(ConfirmDialogComponent, {
            minWidth: '40vw',
            maxHeight: '95vh',
            data: {
              header: 'change the status of the idea to `Assigned`',
            },
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: async (res: { type: 'confirm' | 'cancel' }) => {
              if (res?.type === 'confirm') {
                const newData = {
                  ...tempData(),
                  status: IdeaStatus.ASSIGNED,
                };
                setTempData(newData);
              }
            },
          });
      },
    })
  ),

  // Business methods
  withMethods(
    ({
      startLoading,
      stopLoading,
      assignment,
      tempData,
      _showSuccess,
      _showError,
      connectedUserId,
      assiService,
      assignmentId,
      ideaId,
      updateIdea,
      reloadIdea,
      ...store
    }) => ({
      saveChanges: async () => {
        startLoading('save-changes');
        let body: Partial<AssignmentUpdate> = {
          id: assignmentId(),
          due_date: tempData()?.dueDate,
          assignees: tempData()?.assignees,
          progress: tempData()?.progress,
        };

        try {
          const response = await lastValueFrom(assiService.update(body));

          // Update idea body
          let ideaBody: Partial<IdeaUpdate> | undefined;

          // Update idea status
          const updatedIdeaStatus = tempData()?.status;
          if (updatedIdeaStatus) {
            ideaBody = {
              status: updatedIdeaStatus as IdeaStatusType,
            };
          }

          // Update idea status
          const updatedProgress = tempData()?.progress;
          if (updatedProgress != undefined) {
            ideaBody = {
              ...ideaBody,
              status:
                updatedProgress === 100
                  ? IdeaStatus.IMPLEMENTED
                  : IdeaStatus.IN_PROGRESS,
            };
          }

          if (ideaBody) updateIdea({ ...ideaBody, id: ideaId() });

          patchState(store, {
            assignment: response.data as Assignment,
            tempData: undefined,
          });

          _showSuccess('Changes saved successfully.');
        } catch {
          _showError('Error occured while saving the changes.');
        } finally {
          stopLoading('save-changes');
        }
      },
    })
  )
);
