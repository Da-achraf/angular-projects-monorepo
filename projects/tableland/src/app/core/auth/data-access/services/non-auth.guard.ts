import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { waitForAuthInit } from '../../../guards/guard.util';
import { ToasterService } from '../../../toast/toaster.service';
import { AuthStore } from '../auth.store';

/**
 * A guard to prevent authenticated users from accessing routes that are only for non-authenticated users.
 * For example, this guard can be used on the login or signup routes to redirect authenticated users
 * to the home page.
 *
 * @returns {boolean}
 * - `true`: If the user is **not** authenticated, allowing access to the route.
 * - `false`: If the user is authenticated, blocking access and redirecting to the home page.
 */
export const NonAuthGuard: CanActivateFn = async () => {
  // Check if the user is logged
  const authStore = inject(AuthStore);
  const router = inject(Router)
  const toaster = inject(ToasterService)

  await waitForAuthInit(authStore.initialized);

  const isLoggedIn = authStore.loggedIn();

  // Allow access to the route
  if (!isLoggedIn) {
    return true;
  }

  // If the user is logged in, show a warning message using the ToasterService
  toaster.showWarning('You need to logout first.');

  // Redirect the user to the home page
  router.navigateByUrl('/app');

  // Block access to the route
  return false;
};
