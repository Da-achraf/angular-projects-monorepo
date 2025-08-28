import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    redirectTo: 'areas',
    pathMatch: 'full',
  },
  {
    path: 'areas',
    loadComponent: () =>
      import('./areas-view/areas-view.component').then(
        c => c.AreasViewComponent
      ),
  },
  {
    path: 'areas/:areaId/machines',
    loadComponent: () =>
      import('./machines-view/machines-view.component').then(
        c => c.MachinesViewComponent
      ),
  },
  {
    path: 'machines/:machineId',
    loadComponent: () =>
      import('./machine-detail/machine-detail.component').then(
        c => c.MachineDetailComponent
      ),
  },

  {
    path: 'rescan',
    loadComponent: () =>
      import(
        './machine-detail/material-replenishment/material-replenishment.component'
      ).then(c => c.MaterialReplenishmentComponent),
  },
];
