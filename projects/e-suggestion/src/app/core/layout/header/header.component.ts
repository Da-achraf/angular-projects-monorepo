import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ba/core/data-access';
import { PopoverModule } from 'primeng/popover';
import { LogoComponent } from '../../../ui/components/logo.component';
import { AuthStore } from '../../auth/data-access/auth.store';
import { LanguageSwitcherComponent } from '../../home/language-switcher.component';
import { NotificationSocketService } from '../../notifications/notification-socket.service';
import { NotificationsPanelComponent } from '../../notifications/notifications-panel/notifications-panel.component';
import { SidebarService } from '../data-access/sidebar.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
    LogoComponent,
    NgClass,
    PopoverModule,
    NotificationsPanelComponent,
    FormsModule,
    TranslatePipe,
    LanguageSwitcherComponent,
    RouterLink,
  ],
})
export class HeaderComponent {
  private readonly store = inject(AuthStore);
  private readonly sidebarService = inject(SidebarService);

  protected readonly notifService = inject(NotificationSocketService);

  protected readonly sidebarOpened = this.sidebarService.sideNavOpened;

  logout() {
    this.store.logout();
  }

  toggleSidebar() {
    this.sidebarService.toggleSideNav();
  }

  onNotificationPanelOpened() {
    this.notifService.refreshNotifications();
  }
}
