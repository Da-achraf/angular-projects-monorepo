import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';
import {
  SelectButton,
  SelectButtonOptionClickEvent,
} from 'primeng/selectbutton';
import { LogoComponent } from '../../../ui/components/logo.component';
import { AuthStore } from '../../auth/data-access/auth.store';
import { NotificationSocketService } from '../../notifications/notification-socket.service';
import { NotificationsPanelComponent } from '../../notifications/notifications-panel/notifications-panel.component';
import { TranslatePipe } from '../../translation/translate.pipe';
import { TranslationService } from '../../translation/translation.service';
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
    SelectButton,
    TranslatePipe,
  ],
})
export class HeaderComponent implements OnInit {
  private readonly store = inject(AuthStore);
  private readonly sidebarService = inject(SidebarService);

  protected readonly notifService = inject(NotificationSocketService);

  protected readonly sidebarOpened = this.sidebarService.sideNavOpened;

  protected translationService = inject(TranslationService);

  stateOptions: any[] = [
    { label: 'En', value: 'en', title: 'English' },
    { label: 'Ar', value: 'ar', title: 'Arabic' },
  ];

  defaultLang!: 'ar' | 'en';

  onLangChanged(event: SelectButtonOptionClickEvent) {
    const selectedLang: 'ar' | 'en' = event.option.value;
    this.translationService.setLanguage(selectedLang);
  }

  ngOnInit(): void {
    this.defaultLang = this.translationService.selectedLanguage();
  }

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
