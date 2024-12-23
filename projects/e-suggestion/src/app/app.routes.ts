import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./core/home/home.component')
            .then(c => c.HomeComponent)        
    },
    {
        path: 'register',
        loadComponent: () => import('./core/auth/feature-auth/register/register.component')
            .then(c => c.RegisterComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./core/auth/feature-auth/login/login.component')
            .then(c => c.LoginComponent)
    },
    {
        path: '**',
        redirectTo: 'home', pathMatch: 'full'
    },
];
