import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { withCallState } from '@ba/core/data-access';
import { FormErrorsStore } from '@ba/core/forms';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe } from 'rxjs';
import { AuthState, LoginUser, RegisterUser, authInitialState, initialUserValue } from './auth.model';
import { AuthService } from './services/auth.service';


export function withAuth() {
  return signalStoreFeature(
    withState<AuthState>(authInitialState),
    withMethods(
      (store, formErrorsStore = inject(FormErrorsStore), authService = inject(AuthService), router = inject(Router)) => ({
        login: rxMethod<LoginUser>(
          pipe(
            exhaustMap((credentials) =>
              authService.login(credentials).pipe(
                tapResponse({
                  next: (user) => {
                    patchState(store, { user, loggedIn: true });
                    router.navigateByUrl('/');
                  },
                  error: ({ error }) => {
                    formErrorsStore.setErrors({ '': error.detail })
                  },
                }),
              ),
            ),
          ),
        ),
        register: rxMethod<RegisterUser>(
          pipe(
            exhaustMap((newUserData) =>
              authService.register(newUserData).pipe(
                tapResponse({
                  next: user => {
                    patchState(store, { user, loggedIn: true });
                    router.navigateByUrl('/');
                  },
                  error: ({ error }) => {
                    formErrorsStore.setErrors({ '': error.detail })
                  },
                }),
              ),
            ),
          ),
        ),
        logout: rxMethod<void>(
          pipe(
            exhaustMap(() =>
              authService.logout().pipe(
                tapResponse({
                  next: () => {
                    patchState(store, { user: initialUserValue, loggedIn: false });
                    router.navigateByUrl('/login');
                  },
                  error: ({ error }) => formErrorsStore.setErrors(error.errors),
                }),
              ),
            ),
          ),
        ),
      }),
    ),
    withCallState({ collection: 'getUser' }),
  )
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withAuth()
);

// export const AuthStore = signalStore(
//   { providedIn: 'root' },
//   withState<AuthState>(authInitialState),
//   withMethods(
//     (store, formErrorsStore = inject(FormErrorsStore), authService = inject(AuthService), router = inject(Router)) => ({
//       login: rxMethod<LoginUser>(
//         pipe(
//           exhaustMap((credentials) =>
//             authService.login(credentials).pipe(
//               tapResponse({
//                 next: (user) => {
//                   patchState(store, { user, loggedIn: true });
//                   router.navigateByUrl('/');
//                 },
//                 error: ({ error }) => {
//                   formErrorsStore.setErrors({'login-error' : error.detail})
//                 },
//               }),
//             ),
//           ),
//         ),
//       ),
//       register: rxMethod<RegisterUser>(
//         pipe(
//           exhaustMap((newUserData) =>
//             authService.register(newUserData).pipe(
//               tapResponse({
//                 next: user => {
//                   patchState(store, { user, loggedIn: true });
//                   router.navigateByUrl('/');
//                 },
//                 error: ({ error }) => {
//                   console.error('Error in register: ', error)
//                   formErrorsStore.setErrors({'register-error': error.detail})
//                 },
//               }),
//             ),
//           ),
//         ),
//       ),
//       logout: rxMethod<void>(
//         pipe(
//           exhaustMap(() =>
//             authService.logout().pipe(
//               tapResponse({
//                 next: () => {
//                   patchState(store, { user: initialUserValue, loggedIn: false });
//                   router.navigateByUrl('/login');
//                 },
//                 error: ({ error }) => formErrorsStore.setErrors(error.errors),
//               }),
//             ),
//           ),
//         ),
//       ),
//     }),
//   ),
//   withCallState({ collection: 'getUser' }),
// );