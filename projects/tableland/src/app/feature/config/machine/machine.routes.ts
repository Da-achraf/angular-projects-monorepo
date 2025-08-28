import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    data: {
      breadcrumb: {
        label: 'Machines',
      },
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./machines-list/machines-list.component').then(
            m => m.MachinesListComponent
          ),
        data: { breadcrumb: { label: 'List' } },
      },
    ],
  },
];
