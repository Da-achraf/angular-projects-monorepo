import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/data-access/auth.store';
import { waitForAuthInit } from '../../../core/guards/guard.util';
import { IdeaStore, IdeaStoreType } from '../services/idea.store';

/**
 *
 * @param permissionSelector
 * @returns boolean
 *
 * Utility to create routes guards for the idea
 * feature dynamically.
 */
const createPermissionGuard = (
  permissionSelector: (store: IdeaStoreType) => boolean
): CanActivateFn => {
  return async (route, state) => {
    const router = inject(Router);
    const authStore = inject(AuthStore);
    const ideaStore = inject(IdeaStore);

    const isAuthInitialized = await waitForAuthInit(authStore.initialized);

    if (!isAuthInitialized) {
      console.error('Auth guard timeout: initialization took too long');
      router.navigateByUrl('/app/ideas');
      return false;
    }

    if (permissionSelector(ideaStore)) {
      return true;
    }

    router.navigateByUrl('/app/ideas');
    return false;
  };
};

/**
 * Created guards using the utility
 */
export const CreatePageGuard = createPermissionGuard((store) =>
  store.withIdeaCreate()
);
export const ViewDetailPageGuard = createPermissionGuard((store) =>
  store.withIdeaViewDetail()
);
export const EditPageGuard = createPermissionGuard((store) =>
  store.withIdeaEdit()
);
export const ReviewPageGuard = createPermissionGuard((store) =>
  store.withIdeaReview()
);
