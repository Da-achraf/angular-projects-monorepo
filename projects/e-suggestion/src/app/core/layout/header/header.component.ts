import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LogoComponent } from '../../../ui/components/logo.component';
import { AuthStore } from '../../auth/data-access/auth.store';
import { SidebarService } from '../data-access/sidebar.service';
import { IdeaStore } from '../../../feature/idea/services/idea.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [LogoComponent, NgClass],
})
export class HeaderComponent {
  private readonly store = inject(AuthStore);
  private readonly sidebarService = inject(SidebarService);

  protected readonly sidebarOpened = this.sidebarService.sideNavOpened

  logout() {
    this.store.logout();
  }

  toggleSidebar() {
    this.sidebarService.toggleSideNav();
  }
}
