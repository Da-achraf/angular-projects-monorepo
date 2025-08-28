import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthStore } from '../auth.store';
import { waitForAuthInit } from '../../../guards/guard.util';

export const AuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const currentPath = route.url[0]?.path;

  const authRoutes = ['register', 'home', 'login'];

  const isInitialized = await waitForAuthInit(authStore.initialized);

  if (!isInitialized) {
    console.error('Guard timeout: initialization took too long');
    router.navigateByUrl('/login');
    return false;
  }

  if (!authStore.loggedIn()) {
    return router.parseUrl('/login');
  }
  //  else if (authRoutes.includes(currentPath)) {
  //   console.log('route: ', route)
  //   console.log('state: ', state)
  //   return false
  // }

  return true;
};
