import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthStore } from '../auth.store';
import { ToasterService } from '../../../toast/toaster.service';
import { waitForAuthInit } from '../../../guards/guard.util';

/**
 * A guard to protect routes that require authentication.
 * This guard ensures that only authenticated users can access certain routes.
 * If the user is not logged in, they will be redirected to the login page
 * and shown a warning message.
 *
 * @returns {boolean}
 * - `true`: If the user is authenticated, allowing access to the route.
 * - `false`: If the user is not authenticated, blocking access and redirecting to the login page.
 */
export const AuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router)
  const toaster = inject(ToasterService)

  await waitForAuthInit(authStore.initialized);

  // Check if the user is logged
  const isLoggedIn = authStore.loggedIn();

  // Allow access to the route
  if (isLoggedIn) {
    return true;
  }

  inject(ToasterService).showWarning('Please Login First');

  // If the user is not logged in, redirect them to the login page
  // with the original visisted url as query param
  inject(Router).navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });

  // Block access to the route
  return false;
};
