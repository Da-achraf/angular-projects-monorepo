import { DatePipe, NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../../../ui/pipes/time-ago.pipe';
import { Notification } from '../notification-socket.service';

@Component({
  selector: 'ba-notification-item',
  templateUrl: 'notification-item.component.html',
  imports: [TimeAgoPipe, NgClass, RouterLink, DatePipe],
})
export class NotificationItemComponent {
  notification = input.required<Notification>();

  // Event emitted with notification id when it's opened (link clicked)
  opened = output<number>();
}
