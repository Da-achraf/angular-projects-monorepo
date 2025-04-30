import { CommonModule, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ba/core/data-access';
import { SidebarService } from '../../data-access/sidebar.service';

/**
 * This component is the opened sidebar
 *
 */
@Component({
  selector: 'app-expanded-sidebar',
  standalone: true,
  templateUrl: './expanded-sidebar.component.html',
  styleUrl: './expanded-sidebar.component.scss',
  imports: [
    RouterLink,
    NgClass,
    RouterLinkActive,
    CommonModule,
    TranslatePipe,
  ],
})
export class ExpandedSidebarComponent {
  // Injected dependencies
  private sidebarService = inject(SidebarService);

  // Component signals and computed values
  sideBarOpened = this.sidebarService.sideNavOpened;
  filteredItems = this.sidebarService.filteredItems;
  menuVisibleMap = signal<Record<string, boolean>>({}); // {menuLabel: boolean}

  navigatedToMenuLabel = computed(() => {
    const path = this.sidebarService.path();
    const sidebarItems = this.filteredItems();

    return sidebarItems.find(
      item => item.isMenu && item.children?.map(ch => ch.link).includes(path)
    )?.label;
  });

  // Component methods
  sideBarToggler() {
    this.sidebarService.toggleSideNav();
  }

  toggleMenu = (itemId: string) => {
    this.menuVisibleMap.update(map => ({
      // Clear other menus
      ...Object.keys(map).reduce(
        (acc, key) => ({
          ...acc,
          [key]: false,
        }),
        {}
      ),

      // Toggle current menu
      [itemId]: !map[itemId],
    }));
  };
}
