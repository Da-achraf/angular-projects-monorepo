import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    data: {
      breadcrumb: {
        label: 'Plants',
      },
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./plants-list/plants-list.component').then(
            m => m.PlantsListComponent
          ),
        data: {
          breadcrumb: {
            label: 'List',
          },
        },
      },
    ],
  },
];
