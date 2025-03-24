import { inject, ProviderToken } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiResponse } from './api.model';

export interface WithSimpleEntityState<T> {
  allEntities: T[];
}

type ResponseType<Entity> = Observable<ApiResponse<Entity[]>>;

export function withSimpleEntities<Entity extends { id: number }>(
  Loader: ProviderToken<{
    loadAll: () => ResponseType<Entity>;
  }>
) {
  return signalStoreFeature(
    withState<WithSimpleEntityState<Entity>>({
      allEntities: [],
    }),
    withProps(() => ({
      loader: inject(Loader),
    })),
    withMethods(({ loader, ...state }) => ({
      loadAll: rxMethod<void>(
        pipe(
          switchMap(() =>
            loader.loadAll().pipe(
              tapResponse({
                next: (response) => {
                  patchState(state, { allEntities: response.data as Entity[] });
                },
                error: console.error,
              })
            )
          )
        )
      ),
    })),
    withHooks(({ loadAll }) => ({
      onInit: () => {
        loadAll()
      },
    }))
  );
}
