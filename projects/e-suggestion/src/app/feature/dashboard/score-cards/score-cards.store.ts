import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { QueryParamType } from '../../../core/api/api.model';
import { computed, inject } from '@angular/core';
import { ScoreCardService } from './score-cards.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { withLoading } from '@ba/core/data-access';
import { tapResponse } from '@ngrx/operators';
import { withKpisFeature } from '../../../core/crud/with-kpis.feature';

type ScoreCardType = {
  total: number;
  implemented: number;
  pending: number;
  rejected: number;
};

const initialState: ScoreCardType = {
  total: 0,
  implemented: 0,
  pending: 0,
  rejected: 0,
};

export const ScoreCardStore = signalStore(
  withState(initialState),

  withLoading(),

  withKpisFeature(),

  withProps(() => ({ service: inject(ScoreCardService) })),

  withComputed(({ loadingStates }) => ({
    loading: computed(() => loadingStates()['load'] || false),
  })),

  withMethods(({ service, startLoading, stopLoading, ...store }) => ({
    ideasCount: rxMethod<QueryParamType>(
      pipe(
        tap(() => startLoading('load')),
        switchMap(params =>
          service.ideasCount(params).pipe(
            tapResponse({
              next: resp =>
                patchState(store, {
                  total: resp.total,
                  implemented: resp.implemented,
                  pending: resp.pending,
                  rejected: resp.rejected,
                }),

              error: err => console.error('Error loading ideas count: ', err),
              finalize: () => stopLoading('load'),
            })
          )
        )
      )
    ),
  })),
  withHooks(({ ideasCount, queryParams }) => ({
    onInit: () => {
      ideasCount(queryParams);
    },
  }))
);
