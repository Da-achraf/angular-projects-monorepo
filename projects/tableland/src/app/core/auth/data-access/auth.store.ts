// import { computed, inject } from '@angular/core';
// import { Router } from '@angular/router';
// import {
//   API_REQUEST_DELAY,
//   withCallState,
//   withLoading,
//   withSnackBarFeature,
// } from '@ba/core/data-access';
// import { FormErrorsStore } from '@ba/core/forms';
// import { tapResponse } from '@ngrx/operators';
// import {
//   patchState,
//   signalStore,
//   signalStoreFeature,
//   withComputed,
//   withHooks,
//   withMethods,
//   withProps,
//   withState,
// } from '@ngrx/signals';
// import { rxMethod } from '@ngrx/signals/rxjs-interop';
// import { delay, exhaustMap, pipe, switchMap, tap } from 'rxjs';
// import {
//   AuthState,
//   LoginUser,
//   RegisterUser,
//   RoleEnum,
//   authInitialState,
//   initialUserValue,
// } from './auth.model';
// import { AuthService } from './services/auth.service';
// import { TokenService } from './services/token.service';
// import { v4 as uuidv4 } from 'uuid';

// export function withAuth() {
//   return signalStoreFeature(
//     withState<AuthState>(authInitialState),

//     withLoading(),
//     withSnackBarFeature(),

//     withProps(() => ({
//       formErrorsStore: inject(FormErrorsStore),
//       authService: inject(AuthService),
//       router: inject(Router),
//       tokenService: inject(TokenService),
//       requestDelay: inject(API_REQUEST_DELAY),
//     })),

//     // User data
//     withComputed(({ user }) => ({
//       userRoles: computed(() => user.roles()),
//       userRolesNames: computed(() => {
//         const rolesNames = user.roles().map((r) => r.name);
//         console.log('AuthStore - Caclulated roles names: ', rolesNames);
//         return rolesNames;
//       }),
//       userFullName: computed(() => `${user.first_name()} ${user.last_name()}`),
//       connectedUserId: computed(() => user.id()),
//     })),

//     // Logged in user roles
//     withComputed(({ userRolesNames }) => ({
//       isTeoaMember: computed(() => userRolesNames().includes(RoleEnum.TEOA)),
//       isCommitteeMember: computed(() =>
//         userRolesNames().includes(RoleEnum.COMMITTEE)
//       ),
//       isSubmitter: computed(() =>
//         userRolesNames().includes(RoleEnum.SUBMITTER)
//       ),
//       isSystemAdmin: computed(() =>
//         userRolesNames().includes(RoleEnum.SYSTEM_ADMIN)
//       ),
//     })),

//     // Loading states
//     withComputed(({ loadingStates }) => ({
//       isLoginIn: computed(() => loadingStates()['login'] || false),
//       isRegistering: computed(() => loadingStates()['register'] || false),
//     })),

//     withMethods(
//       ({
//         formErrorsStore,
//         authService,
//         startLoading,
//         stopLoading,
//         router,
//         tokenService,
//         requestDelay,
//         _showError,
//         _showSuccess,
//         ...store
//       }) => ({
//         login: rxMethod<LoginUser>(
//           pipe(
//             tap((_) => startLoading('login')),
//             delay(requestDelay),
//             exhaustMap((credentials) =>
//               authService.login(credentials).pipe(
//                 tapResponse({
//                   next: (user) => {
//                     patchState(store, { user, loggedIn: true });
//                     tokenService.setToken(user.token);
//                     _showSuccess('Logged in successfully.');
//                     router.navigateByUrl('/app');
//                   },
//                   error: ({ error }) => {
//                     formErrorsStore.setErrors({
//                       '': error.detail ? error.detail : 'Something went wrong',
//                     });
//                   },
//                   finalize: () => stopLoading('login'),
//                 })
//               )
//             )
//           )
//         ),

//         register: rxMethod<RegisterUser>(
//           pipe(
//             tap((_) => startLoading('register')),
//             delay(requestDelay),
//             exhaustMap((newUserData) =>
//               authService.register(newUserData).pipe(
//                 tapResponse({
//                   next: (user) => {
//                     patchState(store, { user, loggedIn: true });
//                     tokenService.setToken(user.token);
//                     _showSuccess('Registered successfully.');
//                     router.navigateByUrl('/login');
//                   },
//                   error: ({ error }) => {
//                     formErrorsStore.setErrors({ '': error.detail });
//                   },
//                   finalize: () => stopLoading('register'),
//                 })
//               )
//             )
//           )
//         ),

//         logout: rxMethod<void>(
//           pipe(
//             exhaustMap(() =>
//               authService.logout().pipe(
//                 tapResponse({
//                   next: () => {
//                     patchState(store, {
//                       user: initialUserValue,
//                       loggedIn: false,
//                     });
//                     tokenService.removeToken();
//                     /**
//                      * using location to navigate instead of
//                      */
//                     window.location.href = '/login';
//                     // router.navigateByUrl('/login');
//                   },
//                   error: ({ error }) => formErrorsStore.setErrors(error.errors),
//                 })
//               )
//             )
//           )
//         ),

//         getUser: rxMethod<number>(
//           pipe(
//             switchMap((id) =>
//               authService.getUser(id).pipe(
//                 tapResponse({
//                   next: (user) => {
//                     patchState(store, {
//                       user,
//                       loggedIn: true,
//                     });
//                     tokenService.setToken(user.token);
//                   },
//                   error: () => console.error,
//                   finalize: () => patchState(store, { initialized: true }),
//                 })
//               )
//             )
//           )
//         ),
//       })
//     ),
//     withCallState({ collection: 'auth' }),
//     withHooks(({ getUser, tokenService, ...store }) => ({
//       onInit() {
//         const userId = tokenService.getDecodedToken()?.sub;
//         if (!userId) {
//           patchState(store, { initialized: true });
//           return;
//         }

//         getUser(+userId);
//       },
//       onDestroy: () => {},
//     }))
//   );
// }

// export const AuthStore = signalStore({ providedIn: 'root' }, withAuth());
// export type AuthStoreType = InstanceType<typeof AuthStore>;

import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { API_REQUEST_DELAY, withLoading } from '@ba/core/data-access';

import { withToasterFeature } from '@ba/core/data-access/toaster';
import { FormErrorsStore } from '@ba/core/forms';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { delay, exhaustMap, pipe, switchMap, tap } from 'rxjs';
import {
  AuthState,
  LoginUser,
  RegisterUser,
  RoleEnum,
  authInitialState,
  initialUserValue,
} from './auth.model';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

// 1. Singleton AuthStore
export const AuthStore = signalStore(
  { providedIn: 'root' }, // Global singleton
  withState<AuthState>(authInitialState),
  withLoading(),
  withToasterFeature(),

  withProps(() => ({
    formErrorsStore: inject(FormErrorsStore),
    authService: inject(AuthService),
    router: inject(Router),
    tokenService: inject(TokenService),
    requestDelay: inject(API_REQUEST_DELAY),
  })),

  // User data
  withComputed(({ user }) => ({
    userRoles: computed(() => user.roles()),
    userRolesNames: computed(() => user.roles().map(r => r.name)),
    userFullName: computed(() => `${user.first_name()} ${user.last_name()}`),
    connectedUserId: computed(() => user.id()),
  })),

  // Logged in user roles
  withComputed(({ userRolesNames }) => ({
    isTeoaMember: computed(() => userRolesNames().includes(RoleEnum.TEOA)),
    isCommitteeMember: computed(() =>
      userRolesNames().includes(RoleEnum.COMMITTEE)
    ),
    isSubmitter: computed(() => userRolesNames().includes(RoleEnum.SUBMITTER)),
    isSystemAdmin: computed(() =>
      userRolesNames().includes(RoleEnum.SYSTEM_ADMIN)
    ),
  })),

  // Loading states
  withComputed(({ loadingStates }) => ({
    isLoginIn: computed(() => loadingStates()['login'] || false),
    isRegistering: computed(() => loadingStates()['register'] || false),
  })),

  withMethods(store => {
    const {
      formErrorsStore,
      authService,
      startLoading,
      stopLoading,
      router,
      tokenService,
      requestDelay,
      _showError,
      _showSuccess,
      ...state
    } = store;

    return {
      login: rxMethod<LoginUser>(
        pipe(
          tap(() => startLoading('login')),
          delay(requestDelay),
          exhaustMap(credentials =>
            authService.login(credentials).pipe(
              tapResponse({
                next: user => {
                  patchState(state, { user, loggedIn: true });
                  tokenService.setToken(user.token);
                  _showSuccess('Logged in successfully.');
                  router.navigateByUrl('/app');
                },
                error: ({ error }) => {
                  formErrorsStore.setErrors({
                    '': error.detail || 'Something went wrong',
                  });
                },
                finalize: () => stopLoading('login'),
              })
            )
          )
        )
      ),

      register: rxMethod<RegisterUser>(
        pipe(
          tap(() => startLoading('register')),
          delay(requestDelay),
          exhaustMap(newUserData =>
            authService.register(newUserData).pipe(
              tapResponse({
                next: user => {
                  // patchState(state, { user, loggedIn: true });
                  // tokenService.setToken(user.token);
                  _showSuccess('Registered successfully.');
                  router.navigateByUrl('/login');
                },
                error: ({ error }) => {
                  formErrorsStore.setErrors({ '': error.detail });
                },
                finalize: () => stopLoading('register'),
              })
            )
          )
        )
      ),

      logout: rxMethod<void>(
        pipe(
          exhaustMap(() =>
            authService.logout().pipe(
              tapResponse({
                next: () => {
                  patchState(state, {
                    user: initialUserValue,
                    loggedIn: false,
                  });
                  tokenService.removeToken();
                  router.navigateByUrl('/login');
                },
                error: ({ error }) => formErrorsStore.setErrors(error.errors),
              })
            )
          )
        )
      ),

      getUser: rxMethod<number>(
        pipe(
          switchMap(id =>
            authService.getUser(id).pipe(
              tapResponse({
                next: user => {
                  patchState(state, { user, loggedIn: true });
                  tokenService.setToken(user.token);
                },
                error: () => console.error,
                finalize: () => patchState(state, { initialized: true }),
              })
            )
          )
        )
      ),
    };
  }),

  withHooks({
    onInit({ getUser, tokenService, ...store }) {
      const userId = tokenService.getDecodedToken()?.sub;
      if (!userId) {
        patchState(store, { initialized: true });
        return;
      }

      getUser(+userId);
    },
  })
);

// Feature Store Bridge
export function withAuth() {
  return signalStoreFeature(
    // Inject singleton instance
    withProps(() => {
      const authStore = inject(AuthStore);
      return { authStore };
    }),

    withToasterFeature(),

    withProps(({ authStore }) => ({
      router: authStore.router,
    })),

    // Expose state
    withComputed(({ authStore }) => ({
      loggedIn: authStore.loggedIn,
      user: authStore.user,
      initialized: authStore.initialized,
    })),

    // Expose computed properties
    withComputed(({ authStore }) => ({
      userRoles: authStore.userRoles,
      userRolesNames: authStore.userRolesNames,
      userFullName: authStore.userFullName,
      isTeoaMember: authStore.isTeoaMember,
      isCommitteeMember: authStore.isCommitteeMember,
      isSubmitter: authStore.isSubmitter,
      isSystemAdmin: authStore.isSystemAdmin,
      connectedUserId: authStore.connectedUserId,
      loadingStates: authStore.loadingStates,
    })),

    // Expose methods
    withMethods(({ authStore }) => ({
      login: authStore.login,
      logout: authStore.logout,
      register: authStore.register,
      getUser: authStore.getUser,
      startLoading: authStore.startLoading,
      stopLoading: authStore.stopLoading,
    }))
  );
}

export type AuthStoreType = InstanceType<typeof AuthStore>;
