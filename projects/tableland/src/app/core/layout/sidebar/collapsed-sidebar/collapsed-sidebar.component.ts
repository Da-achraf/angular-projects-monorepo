import {
  Location,
  NgClass,
  NgTemplateOutlet,
  TitleCasePipe,
} from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AuthStore } from '../../../auth/data-access/auth.store';
import { TranslatePipe } from '@ba/core/data-access';
import { SidebarItem } from '../../data-access/sidebar.model';
import { SidebarService } from '../../data-access/sidebar.service';

import { TippyDirective } from '@ngneat/helipopper';
import { RoleNamePipe } from '../../../auth/feature-auth/pipes/role-name.pipe';


/**
 * This component is the closed sidebar (collapsed)
 *
 */
@Component({
  selector: 'app-collapsed-sidebar',
  templateUrl: './collapsed-sidebar.component.html',
  styleUrl: './collapsed-sidebar.component.scss',
  imports: [
    RouterLink,
    NgClass,
    NgTemplateOutlet,
    RouterLinkActive,
    MatTooltipModule,
    TitleCasePipe,
    TranslatePipe,
    TippyDirective,
    RoleNamePipe
  ],
})
export class SidebarComponent implements OnInit {
  // Injected dependencies
  sidebarService = inject(SidebarService);
  authStore = inject(AuthStore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);

  // Component signals and computed values
  sidebarItems = this.sidebarService.sidebarItems;
  filteredItems = this.sidebarService.filteredItems;
  openedItem = signal<SidebarItem | undefined>(undefined);
  openedItemY = signal(0);
  menuHovered = signal(false);

  // Component signals and computed values
  userFullName = this.authStore.userFullName;
  userRoles = this.authStore.userRolesNames()

  navigatedToMenu = computed(() => {
    const path = this.sidebarService.path();
    const sidebarItems = this.sidebarItems();

    return sidebarItems.find(
      item => item.isMenu && item.children?.map(ch => ch.link).includes(path)
    );
  });

  // Hooks
  ngOnInit(): void {}

  // Methods
  onMouseEnter = (item: SidebarItem, ev: MouseEvent) => {
    const rect = (ev.target as HTMLElement).getBoundingClientRect();
    const elementY = rect.top;
    this.openedItemY.set(elementY - 64);
    this.openedItem.set(item);

    this.toggleMenu(item, ev);
  };

  onMouseLeave = (item: SidebarItem, ev: MouseEvent) => {
    const relatedTarget = ev.relatedTarget as HTMLElement;
    // Check if we're moving to the menu or the invisible bridge
    if (!relatedTarget?.closest('.absolute')) {
      this.closeAllMenus();
    }
  };

  onMouseEnterMenu = (parentItem: SidebarItem, ev: MouseEvent) => {
    this.menuHovered.set(true);
  };

  onMouseLeaveMenu = (parentItem: SidebarItem, ev: MouseEvent) => {
    this.menuHovered.set(false);
    this.openedItem.set(undefined);
    this.closeAllMenus();
  };

  toggleMenu = (item: SidebarItem, ev: MouseEvent) => {
    this.closeAllMenus();

    const filteredItems = this.filteredItems();
    this.sidebarItems.set([...filteredItems]);

    const updatedItems = filteredItems.map(i => {
      if (i.label === item.label) return { ...i, menuVisible: !i.menuVisible };
      return i;
    });

    this.sidebarItems.set(updatedItems);
  };

  closeAllMenus = () => {
    const filteredItems = this.filteredItems();
    this.sidebarItems.set(
      filteredItems.map(i => ({ ...i, menuVisible: false }))
    );
  };

  navigateToRoute = (link: string, ev: MouseEvent) => {
    ev.stopPropagation();

    this.resetMenus();
    this.router.navigateByUrl(link);
  };

  resetMenus = () => {
    this.closeAllMenus();
    this.openedItem.set(undefined);
    this.menuHovered.set(false);
  };
}
