import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { AuthStore } from '../../../core/auth/data-access/auth.store';
import { NotificationItemComponent } from '../../../core/notifications/notification-item/notification-item.component';
import { TranslatePipe } from '../../../core/translation/translate.pipe';
import { RadioFilterComponent } from '../../../pattern/radio-filter/radio.filter.component';
import { GenericTableComponent } from '../../../ui/components/table/generic-table.component';
import { TableColumn } from '../../../ui/components/table/table-types.interface';
import { NotificationStore } from '../notification.store';
import { COLUMNS, Options } from './data';
import { loadNotificationInitialQueryParams } from './notification.util';
import { TranslationService } from '../../../core/translation/translation.service';

@Component({
  selector: 'ba-notifications-list',
  templateUrl: 'notifications-list.component.html',
  imports: [
    GenericTableComponent,
    NotificationItemComponent,
    RadioFilterComponent,
    TooltipModule,
    TranslatePipe,
  ],
})
export class NotificationsListComponent {
  protected store = inject(NotificationStore);
  protected authStore = inject(AuthStore);
  protected translationService = inject(TranslationService);
  protected columns = signal<TableColumn[]>(COLUMNS).asReadonly();

  protected notificationFilterOptions = signal(Options);

  protected checked: boolean = false;

  // initial query params
  protected initialQueryParams = computed(() => {
    const loggedInUser = this.authStore.user();
    if (!loggedInUser.id) return;

    return loadNotificationInitialQueryParams(loggedInUser);
  });

  private queryParamsEffect = effect(() => {
    const initialQueryParams = this.initialQueryParams();
    if (!initialQueryParams) return;

    untracked(() =>
      this.store.initializeQueryParams({
        ...initialQueryParams,
      })
    );
  });
}
