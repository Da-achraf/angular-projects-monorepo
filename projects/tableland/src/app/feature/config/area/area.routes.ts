import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    data: {
      breadcrumb: {
        label: 'Areas',
      },
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./areas-list/areas-list.component').then(
            m => m.AreasListComponent
          ),
        data: { breadcrumb: { label: 'List' } },
      },
    ],
  },
];
