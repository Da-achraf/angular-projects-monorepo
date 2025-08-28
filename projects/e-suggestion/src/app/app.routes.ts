import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/data-access/services/auth.guard';
import { NonAuthGuard } from './core/auth/data-access/services/non-auth.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    canActivate: [NonAuthGuard],
    loadComponent: () =>
      import('./core/home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'register',
    canActivate: [NonAuthGuard],
    loadComponent: () =>
      import(
        './core/auth/feature-auth/components/register/register.component'
      ).then(c => c.RegisterComponent),
  },
  {
    path: 'login',
    canActivate: [NonAuthGuard],
    loadComponent: () =>
      import('./core/auth/feature-auth/components/login/login.component').then(
        c => c.LoginComponent
      ),
  },
  {
    path: '',
    canActivateChild: [AuthGuard],
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
            path: 'home',
            loadChildren: () => import('./feature/dashboard/dashboard.routes'),
          },
          {
            path: 'users',
            loadChildren: () => import('./feature/user/user.routes'),
          },
          {
            path: 'ideas',
            loadChildren: () => import('./feature/idea/idea.routes'),
          },
          {
            path: 'config',
            loadChildren: () => import('./feature/config/config.routes'),
          },
          {
            path: 'notifications',
            loadChildren: () =>
              import('./feature/notification/notification.routes'),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
