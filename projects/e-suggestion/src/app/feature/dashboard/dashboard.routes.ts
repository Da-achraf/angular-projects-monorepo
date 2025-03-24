import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    children: [
      {
        path: '',
        data: {
          breadcrumb: {
            label: 'Home',
          },
        },
        loadComponent: () =>
          import('./home-dashboard/home-dashboard.component').then(
            (m) => m.HomeDashboardHomeComponent
          ),
      },
    ],
  },
];
