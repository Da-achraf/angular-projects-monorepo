import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import(
        './core/auth/feature-auth/components/register/register.component'
      ).then(c => c.RegisterComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/feature-auth/components/login/login.component').then(
        c => c.LoginComponent
      ),
  },

  {
    path: '',
    // canActivateChild: [AuthGuard],
    children: [
      {
        path: 'app',
        loadComponent: () =>
          import('./core/layout/layout.component').then(c => c.LayoutComponent),
        data: {
          breadcrumb: {
            label: 'App',
            icon: 'house',
          },
        },
        children: [
          {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full',
          },
          {
            path: 'config',
            loadChildren: () => import('./feature/config/config.routes'),
          },

          {
            path: 'traceability',
            loadChildren: () =>
              import('./feature/treacability/treacability.routes'),
          },
        ],
      },
    ],
  },
];
