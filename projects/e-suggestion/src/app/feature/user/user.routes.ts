import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import('./components/users-list/users-list.component').then(
            m => m.UsersListComponent
          ),
        data: { breadcrumb: { label: 'Users' } },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile.component').then(
            m => m.ProfileComponent
          ),
        data: { breadcrumb: { label: 'Profile' } },
      },
    ],
  },
];
