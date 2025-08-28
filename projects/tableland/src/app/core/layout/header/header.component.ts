import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ba/core/data-access';
import { PopoverModule } from 'primeng/popover';
import { AuthStore } from '../../auth/data-access/auth.store';
import { SidebarService } from '../data-access/sidebar.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [NgClass, PopoverModule, FormsModule, TranslatePipe, RouterLink],
})
export class HeaderComponent {
  private readonly store = inject(AuthStore);
  private readonly sidebarService = inject(SidebarService);

  protected readonly sidebarOpened = this.sidebarService.sideNavOpened;

  logout() {
    this.store.logout();
  }

  toggleSidebar() {
    this.sidebarService.toggleSideNav();
  }

  // onNotificationPanelOpened() {
  //   this.notifService.refreshNotifications();
  // }
}
