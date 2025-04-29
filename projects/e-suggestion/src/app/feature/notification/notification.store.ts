import { withPagedEntities } from '@ba/core/data-access';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { withAuth } from '../../core/auth/data-access/auth.store';
import {
  Notification,
  NotificationCreate,
  NotificationUpdate,
} from '../../core/notifications/notification.model';
import { NotificationService } from './notification.service';

export const NotificationStore = signalStore(
  withState<{}>({}),
  withPagedEntities<Notification, NotificationCreate, NotificationUpdate>(
    NotificationService
  ),

  withProps(() => ({
    notifService: inject(NotificationService),
  })),

  withAuth(),

  withComputed(({ isSystemAdmin, isTeoaMember, isCommitteeMember }) => ({
    showNotificationFilter: computed(
      () => isSystemAdmin() || isTeoaMember() || isCommitteeMember()
    ),
  })),

  withMethods(
    ({
      setQueryParams,
      notifService,
      startLoading,
      stopLoading,
      _showError,
      _showSuccess,
      trigger,
      user,
      ...store
    }) => ({
      markAllAsRead0: rxMethod<number>(
        pipe(
          tap(_ => startLoading('load')),
          switchMap(userId =>
            notifService.markAllNotificationsAsRead(userId).pipe(
              tapResponse({
                next: () => patchState(store, { trigger: trigger() + 1 }),
                error: () =>
                  _showError('Error marking all notifications as read!'),
              })
            )
          )
        )
      ),
      markAllAsRead: async () => {
        try {
          await lastValueFrom(
            notifService.markAllNotificationsAsRead(user.id())
          );
          patchState(store, { trigger: trigger() + 1 });
          _showSuccess('Marked as read successfully!');
        } catch (error) {
          _showError('Error marking all notifications as read!');
        }
      },

      setFilter: (filter: 'all' | 'read' | 'unread' | string) => {
        switch (filter) {
          case 'all':
            setQueryParams({ read__eq: null });
            break;
          case 'read':
            setQueryParams({ read__eq: true });
            break;
          case 'unread':
            setQueryParams({ read__eq: false });
            break;
        }
      },
    })
  )
);
