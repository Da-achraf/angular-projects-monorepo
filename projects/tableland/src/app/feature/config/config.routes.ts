import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    providers: [],
    children: [
      {
        path: 'plants',
        loadChildren: () => import('./plant/plant.routes'),
      },
      {
        path: 'areas',
        loadChildren: () => import('./area/area.routes'),
      },
      {
        path: 'machines',
        loadChildren: () => import('./machine/machine.routes'),
      },
    ],
  },
];
