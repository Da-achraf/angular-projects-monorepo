import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../pattern/breadcrumb/breadcrumb.component';
import { SidebarService } from './data-access/sidebar.service';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/collapsed-sidebar/collapsed-sidebar.component';
import { ExpandedSidebarComponent } from './sidebar/expanded-sidebar/expanded-sidebar.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ExpandedSidebarComponent,
    SidebarComponent,
    BreadcrumbComponent,
  ],
})
export class LayoutComponent {
  protected isOpen = inject(SidebarService).sideNavOpened;
}
