import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    data: {
      breadcrumb: {
        label: 'Departments',
      },
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./departments-list/departments-list.component').then(
            m => m.DepartmentsListComponent
          ),
        data: { breadcrumb: { label: 'List' } },
      },
    ],
  },
];
