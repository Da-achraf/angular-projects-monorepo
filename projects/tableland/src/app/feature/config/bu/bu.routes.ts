import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    data: {
      breadcrumb: {
        label: 'Busniness Units',
      },
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./bus-list/bus-list.component').then(m => m.BusListComponent),
        data: { breadcrumb: { label: 'List' } },
      },
    ],
  },
];
