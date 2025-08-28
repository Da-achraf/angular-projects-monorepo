import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LocalStorageService, withPagedEntities } from '@ba/core/data-access';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { setEntity } from '@ngrx/signals/entities';
import { withAuth } from '../../../core/auth/data-access/auth.store';
import {
  Idea,
  IdeaCreate,
  IdeaUpdate,
} from '../../../core/idea/models/idea.model';
import { AttachementCreate } from '../../../pattern/attachment-upload/models/attachement.model';
import { AttachementService } from '../../../pattern/attachment-upload/services/attachment.service';
import { DeleteDialogComponent } from '../../../pattern/dialogs/delete-dialog.component';
import { IdeaService } from './idea.service';

const IDEAS_FILTER_TOKEN = 'e-sugeestion-ideas-filter';

export const IdeaStore = signalStore(
  withPagedEntities<Idea, IdeaCreate, IdeaUpdate>(IdeaService),
  withState<{ ideasFilter: string | undefined }>({ ideasFilter: undefined }),

  withAuth(),

  withProps(() => ({
    ideaService: inject(IdeaService),
    attachmentService: inject(AttachementService),
    router: inject(Router),
    dialog: inject(MatDialog),
    destroyRef: inject(DestroyRef),
    localStorage: inject(LocalStorageService),
  })),

  withComputed(({ entities, user, loadingStates }) => ({
    ideasCount: computed(() => entities().length),
    _userId: computed(() => user.id()),

    // Loadings:
    isDeletingAttachment: computed(
      () => loadingStates()['delete-attachment'] || false
    ),
    isUpdating: computed(() => loadingStates()['update'] || false),
  })),

  /**
   * Users permissions on ideas.
   *
   */
  withComputed(({ isSubmitter, isCommitteeMember, isTeoaMember }) => ({
    withIdeaCreate: computed(() => true),
    withIdeaViewDetail: computed(() => true),
    withIdeaEdit: computed(() => isSubmitter()),
    withIdeaDelete: computed(() => isSubmitter()),
    withIdeaExport: computed(() => false),
    withIdeaReview: computed(() => true),

    canViewReviewPage: computed(() => isCommitteeMember() || isTeoaMember()),
    showIdeasFilter: computed(() => isCommitteeMember() || isTeoaMember()),
  })),

  withMethods(({ _userId, attachmentService, localStorage }) => ({
    _uploadAttachments: async (
      ideaId: number,
      attachements: File[]
    ): Promise<Idea> => {
      let lastUploadResult;
      for (const file of attachements) {
        const attachmentBody: AttachementCreate = {
          idea_id: ideaId,
          uploaded_by: _userId(),
          name: file.name,
          size: file.size,
        };
        lastUploadResult = attachmentService.upload(attachmentBody, file);
      }
      return lastUploadResult as Promise<Idea>;
    },

    _saveFilterToLocalStorage: (filter: string) => {
      localStorage.saveItem(IDEAS_FILTER_TOKEN, filter);
    },
  })),

  withMethods(
    ({
      ideaService,
      attachmentService,
      _uploadAttachments,
      setQueryParams,
      router,
      dialog,
      startLoading,
      deleteOne,
      destroyRef,
      stopLoading,
      _showSuccess,
      _showError,
      _saveFilterToLocalStorage,
      _userId,
      ...store
    }) => ({
      createIdea: async (
        ideaBody: Omit<IdeaCreate, 'submitter_id'>,
        attachements: File[]
      ) => {
        startLoading('save');
        try {
          const createIdeaResponse = await ideaService.createIdea({
            ...ideaBody,
            submitter_id: _userId(),
          });

          let createdIdea = createIdeaResponse.data as Idea;
          if (!createdIdea.id) throw new Error('Idea ID is invalid.');

          // Upload idea's attachments
          if (attachements.length > 0) {
            try {
              createdIdea = await _uploadAttachments(
                createdIdea.id,
                attachements
              );
            } catch (uploadError) {
              _showError(
                'Some files failed to upload. You can add them in the edit page.'
              );
              router.navigateByUrl(`/ideas/${createdIdea.id}/edit`);
              return;
            }
          }

          patchState(store, setEntity(createdIdea));
          _showSuccess('Idea created successfully.');
        } catch (err: any) {
          _showError('Failed to create idea');
          throw Error(err);
        } finally {
          stopLoading('save');
        }
      },

      updateIdea: async (ideaBody: Partial<IdeaUpdate>, files: File[]) => {
        startLoading('update');
        try {
          const updatedIdeaResponse = await ideaService.updateIdea({
            ...ideaBody,
            updated_at: new Date().toISOString(),
          });
          let updatedIdea = updatedIdeaResponse.data as Idea;

          if (files.length > 0) {
            try {
              updatedIdea = await _uploadAttachments(updatedIdea.id, files);
            } catch (uploadError) {
              _showError('Some files failed to upload.');
              return;
            }
          }

          patchState(store, setEntity(updatedIdea as Idea));
          _showSuccess('Updated successfully.');
        } catch (err) {
          _showError();
        } finally {
          stopLoading('update');
        }
      },

      showDeleteIdeaDialog: (id: number) => {
        dialog
          .open(DeleteDialogComponent, {
            data: { label: 'idea' },
            minWidth: '40vw',
            maxHeight: '95vh',
          })
          .afterClosed()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: res => {
              if (res && res?.type === 'delete') deleteOne(id);
            },
          });
      },

      deleteAttachment: async (attachmentId: number) => {
        try {
          startLoading('delete-attachment');
          await attachmentService.deleteOne(attachmentId);
          _showSuccess('Attachment deleted successfully.');
        } catch (error) {
          _showSuccess('Error deleting the attachment.');
        } finally {
          stopLoading('delete-attachment');
        }
      },

      setIdeasFilter: (f: string) => {
        if (f === 'all') {
          setQueryParams({
            submitter__id__eq: undefined,
            submitter__id__ne: undefined,
          });
        } else if (f === 'only_yours') {
          setQueryParams({
            submitter__id__eq: _userId(),
            submitter__id__ne: undefined,
          });
        } else if (f === 'only_others') {
          setQueryParams({
            submitter__id__ne: _userId(),
            submitter__id__eq: undefined,
          });
        }

        _saveFilterToLocalStorage(f);
        patchState(store, { ideasFilter: f });
      },
    })
  ),

  withHooks(({ localStorage, setIdeasFilter }) => ({
    onInit: () => {
      const savedFilter = localStorage.getItem(IDEAS_FILTER_TOKEN);
      if (savedFilter) setIdeasFilter(savedFilter);
    },
  }))
);

export type IdeaStoreType = InstanceType<typeof IdeaStore>;
