import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    data: {
      breadcrumb: {
        label: 'Categories',
      },
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./categories-list/categories-list.component').then(
            m => m.CategoriesListComponent
          ),
        data: { breadcrumb: { label: 'List' } },
      },
    ],
  },
];
