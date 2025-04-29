import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToasterService } from '@ba/core/data-access';
import { TooltipModule } from 'primeng/tooltip';
import { AuthStore } from '../../auth/data-access/auth.store';
import { TranslatePipe } from '../../translation/translate.pipe';
import { TranslationService } from '../../translation/translation.service';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import { NotificationSocketService } from '../notification-socket.service';

@Component({
  selector: 'ba-notifications-panel',
  templateUrl: 'notifications-panel.component.html',
  imports: [
    NotificationItemComponent,
    RouterLink,
    TooltipModule,
    NgClass,
    TranslatePipe,
  ],
})
export class NotificationsPanelComponent implements OnInit {
  private readonly authStore = inject(AuthStore);

  private readonly toaster = inject(ToasterService);

  protected readonly notifService = inject(NotificationSocketService);
  protected readonly translationService = inject(TranslationService);

  ngOnInit(): void {
    this.notifService.connect(this.authStore.user.id());

    // Handle errors
    this.notifService.error$.subscribe(error => {
      if (error) this.toaster.showError(error);
    });
  }

  onNotificationOpened(notificationId: number) {
    this.notifService.markAsRead(notificationId);
  }
}
