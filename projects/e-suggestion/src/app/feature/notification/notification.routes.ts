import { Routes } from '@angular/router';
import { NotificationStore } from './notification.store';

export default <Routes>[
  {
    path: '',

    providers: [NotificationStore],

    data: {
      breadcrumb: {
        label: 'Notifications',
      },
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./notifications-list/notifications-list.component').then(
            m => m.NotificationsListComponent
          ),
        data: { breadcrumb: { label: 'List' } },
      },
    ],
  },
];
