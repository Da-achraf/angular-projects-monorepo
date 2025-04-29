import { Injectable } from '@angular/core';
import { CrudBaseService } from '../../core/crud/crud-base.service';
import {
  Notification,
  NotificationCreate,
  NotificationUpdate,
} from '../../core/notifications/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends CrudBaseService<
  Notification,
  NotificationCreate,
  NotificationUpdate
> {
  constructor() {
    super('/notifications');
  }

  markAllNotificationsAsRead(userId: number) {
    return this.apiService.get(`${this.url}/${userId}/mark-all-as-read`)
  }
}
