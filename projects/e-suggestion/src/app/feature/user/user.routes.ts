import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/users-list/users-list.component').then(
            (m) => m.UsersListComponent
          ),
        data: { breadcrumb: { label: 'Users' } },
      },
    ],
  },
];
