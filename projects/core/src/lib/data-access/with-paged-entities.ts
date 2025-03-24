import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { computed, inject, InjectionToken, ProviderToken } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  removeEntity,
  setAllEntities,
  setEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, Observable, pipe } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { ApiResponse, Response } from './api.model';
import { withLoading } from './with-loading';
import { withToasterFeature } from './with-toaster.feature';

export interface WithPagedEntityState<T> {
  page: number;
  total: number;
  pageSize: number;
  item?: T;
  trigger: number;
  queryParams: { [key: string]: any };
}

// Token to provide the initial page size for pagination
export const PAGE_SIZE = new InjectionToken<number>('PAGE_SIZE', {
  factory: () => 25,
});

type ResponseType<Entity> = Observable<ApiResponse<Entity>>;

export function withPagedEntities<
  Entity extends { id: number },
  C,
  U extends { id: number },
>(
  Loader: ProviderToken<{
    load: (
      page: number,
      pageSize: number,
      queryParams?: { [key: string]: any }
    ) => Observable<Response<Entity>>;
    update: (body: Partial<U>) => ResponseType<Entity>;
    save: (body: C) => ResponseType<Entity>;
    loadOne: (id: number) => ResponseType<Entity>;
    delete: (ids: number[]) => ResponseType<Entity>;
    deleteOne: (id: number) => ResponseType<Entity>;
  }>
) {
  return signalStoreFeature(
    withState<WithPagedEntityState<Entity>>({
      page: 1,
      total: 0,
      pageSize: 0,
      trigger: 0,
      queryParams: {},
    }),

    withProps(() => ({
      loader: inject(Loader),
    })),

    withEntities<Entity>(),

    withLoading(),

    withToasterFeature(),

    withComputed(({ trigger, page, pageSize, queryParams, loadingStates }) => ({
      pageAndSizeSignal: computed(() => {
        trigger();
        return {
          page: page(),
          pageSize: pageSize(),
          queryParams: queryParams(),
        };
      }),
      isLoading: computed(() => loadingStates()['load'] || false),
      isSaving: computed(() => loadingStates()['save'] || false),
      isUpdating: computed(() => loadingStates()['update'] || false),
      isDeleting: computed(() => loadingStates()['delete'] || false),
    })),

    withMethods(
      ({
        startLoading,
        stopLoading,
        loader,
        _showSuccess,
        _showError,
        ...state
      }) => ({
        load: rxMethod<{
          page: number;
          pageSize: number;
          queryParams?: { [key: string]: any };
        }>(
          pipe(
            tap(() => startLoading('load')),
            tap(({ page, pageSize, queryParams }) =>
              patchState(state, { page, pageSize, queryParams })
            ),
            debounceTime(1000),
            switchMap(({ page, pageSize, queryParams }) =>
              loader.load(page, pageSize, queryParams).pipe(
                tapResponse({
                  next: response => {
                    patchState(
                      state,
                      setAllEntities(response.content as Entity[]),
                      { page: response.page, total: response.total }
                    );
                  },
                  error: (err: HttpErrorResponse) => {
                    if (err.status === HttpStatusCode.NotFound) {
                      patchState(state, setAllEntities([] as Entity[]), {
                        page: 1,
                        total: 0,
                      });
                    }
                  },
                  finalize: () => stopLoading('load'),
                })
              )
            )
          )
        ),
        save: rxMethod<C>(
          pipe(
            tap(() => startLoading('save')), // Start loading for 'save'
            switchMap(
              async body =>
                await loader.save(body).pipe(
                  tapResponse({
                    next: response => {
                      _showSuccess('Created successfully.');
                      patchState(state, setEntity(response.data as Entity));
                    },
                    error: () => _showError(),
                    finalize: () => stopLoading('save'),
                  })
                )
            )
          )
        ),
        update: rxMethod<Partial<U>>(
          pipe(
            tap(() => startLoading('update')),
            switchMap(body =>
              loader.update(body).pipe(
                tapResponse({
                  next: response => {
                    patchState(state, setEntity(response.data as Entity));
                    _showSuccess('Updated successfully.');
                  },
                  error: () => _showError(),
                  finalize: () => {
                    stopLoading('update');
                  },
                })
              )
            )
          )
        ),
        loadOne: rxMethod<number>(
          pipe(
            tap(() => startLoading('load')),
            switchMap(id =>
              loader.loadOne(id).pipe(
                tapResponse({
                  next: response => {
                    patchState(state, {
                      item: response.data as Entity,
                    });
                  },
                  error: () => _showError(),
                  finalize: () => {
                    stopLoading('load');
                  },
                })
              )
            )
          )
        ),
        deleteOne: rxMethod<number>(
          pipe(
            tap(() => startLoading('delete')),
            switchMap(id =>
              loader.deleteOne(id).pipe(
                tapResponse({
                  next: _ => {
                    patchState(state, removeEntity(id));
                    _showSuccess('Deleted successfully.');
                  },
                  error: () => _showError(),
                  finalize: () => {
                    stopLoading('delete');
                  },
                })
              )
            )
          )
        ),
        setPage: (page: number) => {
          patchState(state, { page, trigger: state.trigger() + 1 });
        },

        setPageSize: (pageSize: number) => {
          patchState(state, { pageSize, trigger: state.trigger() + 1 });
        },

        initializeQueryParams: (queryParams: { [key: string]: any }) => {
          patchState(state, { queryParams, trigger: state.trigger() + 1 });
        },

        setQueryParams: (params: { [key: string]: any }) => {
          patchState(state, {
            queryParams: { ...state.queryParams(), ...params },
            trigger: state.trigger() + 1,
          });
        },
      })
    ),
    withHooks(({ load, pageAndSizeSignal, setPageSize }) => {
      return {
        onInit: () => {
          setPageSize(inject(PAGE_SIZE));
          load(pageAndSizeSignal);
        },
      };
    })
  );
}
