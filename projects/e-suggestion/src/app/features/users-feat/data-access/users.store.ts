import { computed, inject } from '@angular/core';
import { withCallState, withLoading, withPagedEntities } from '@ba/core/data-access';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { authInitialState, AuthState, User } from '../../../core/auth/data-access/auth.model';
import { UsersService } from '../services/users.service';

type UsersState = {
    users: User[]
}

const intitialUsersState: UsersState = {
    users: []
}

export const UsersStore = signalStore(
//   withState<UsersState>(intitialUsersState),
//   withPagedEntities(UsersService),
  withEntities<User>(),
  withLoading(),
  withCallState({ collection: 'getUser' }),

  withComputed(({ entityMap, entities }) => ({
    users: computed(() => entities().filter(en => en.email != ))
  })),

  withMethods((store, usersService = inject(UsersService)) => ({

    updateUser: rxMethod<User>(pipe(
        tap(() => store.setLoading(true)),
        switchMap(user => usersService.update(user).pipe(
            tapResponse({
                next: () => patchState(store, setEntity(user)),
                error: () => console.log(''),
                finalize: () => store.setLoading(false)
            })
        ))
    ))

  }))
);