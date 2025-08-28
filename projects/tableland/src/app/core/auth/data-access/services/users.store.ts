import { TitleCasePipe } from '@angular/common';
import { computed, inject } from '@angular/core';
import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import {
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { NEVER, of, pipe, switchMap } from 'rxjs';
import { RegisterUser, RoleEnum, UpdateUser, User } from '../auth.model';
import { UsersService } from './users.service';

type UsersState = {};

const intitialUsersState: UsersState = {};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState<UsersState>(intitialUsersState),

  withPagedEntities<User, RegisterUser, UpdateUser>(UsersService),

  withSimpleEntities<User>(UsersService),

  withProps(() => ({
    titlePipe: inject(TitleCasePipe),
  })),

  withComputed(({ allEntities, titlePipe }) => ({
    formattedEntities: computed(() =>
      allEntities().map(u => ({
        ...u,
        full_name: `${titlePipe.transform(u.first_name)} ${titlePipe.transform(
          u.last_name
        )}`,
      }))
    ),
  })),

  withComputed(({ formattedEntities }) => ({
    assignees: computed(() =>
      // formattedEntities().filter((u) =>
      //   u.roles.map((r) => r.name).includes(RoleEnum.SUBMITTER)
      // )
      formattedEntities()
    ),
  })),

  withMethods(() => ({
    save: rxMethod<void>(pipe(switchMap(() => of(NEVER)))),
  }))
);
