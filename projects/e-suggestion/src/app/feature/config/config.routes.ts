import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    children: [
      {
        path: 'bus',
        loadChildren: () => import('./bu/bu.routes'),
      },
      {
        path: 'plants',
        loadChildren: () => import('./plant/plant.routes'),
      },
      {
        path: 'departments',
        loadChildren: () => import('./department/department.routes'),
      },
      {
        path: 'categories',
        loadChildren: () => import('./category/category.routes'),
      },
    ],
  },
];
