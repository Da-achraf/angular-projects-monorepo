import { computed, inject } from '@angular/core';
import { withLoading } from '@ba/core/data-access';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { QueryParamType } from '../../../core/api/api.model';
import { BU } from '../../../core/crud/bus/bu.model';
import { withKpisFeature } from '../../../core/crud/with-kpis.feature';
import { createDognutChart } from '../helpers/charts.helper';
import { BuIdeaCount } from './ideas-by-bu.model';
import { IdeasByBuService } from './ideas-by-bus.service';

type BuDashboardState = {
  bus: BU[];
  selectedBus: BU[];
  buIdeaCounts: BuIdeaCount[];
  chartOptions: any;
  loading: boolean;
  error: string | null;
};

const initialState: BuDashboardState = {
  bus: [],
  selectedBus: [],
  buIdeaCounts: [],
  chartOptions: null,
  loading: false,
  error: null,
};

export const IdeasByBuStore = signalStore(
  withState(initialState),

  withLoading(),

  withKpisFeature(),

  withProps(() => ({ service: inject(IdeasByBuService) })),

  withComputed(({ loadingStates }) => ({
    loading: computed(() => loadingStates()['load'] || false),
  })),

  withMethods(({ buIdeaCounts, selectedBus, bus, ...store }) => ({
    // Update chart based on current state
    updateChart() {
      // If no plants selected, show all plants
      const busToShow = selectedBus().length === 0 ? bus() : selectedBus();

      // Filter and sort data
      const filteredData = buIdeaCounts()
        .filter(item => busToShow.some(bu => bu.id === item.buId))
        .sort((a, b) => b.count - a.count);

      // Prepare chart data
      const xAxisData = filteredData.map(item => item.buName);
      const seriesData = filteredData.map(item => ({
        value: item.count,
        name: item.buName,
      }));

      const chartOptions = createDognutChart(xAxisData, seriesData, 'Ideas');
      patchState(store, { chartOptions });
    },
  })),

  withMethods(
    ({ service, startLoading, stopLoading, updateChart, ...store }) => ({
      // Ideas by plant count
      ideasCount: rxMethod<QueryParamType>(
        pipe(
          tap(() => startLoading('load')),
          switchMap(params =>
            service.ideasCount(params).pipe(
              tapResponse({
                next: buIdeaCounts => {
                  patchState(store, { buIdeaCounts });
                  updateChart();
                },

                error: err =>
                  console.error('Error loading ideas count by bus: ', err),
                finalize: () => stopLoading('load'),
              })
            )
          )
        )
      ),
    })
  ),

  withMethods(({ setQueryParams, ...store }) => ({
    setBus: (bus: BU[]) => {
      patchState(store, { bus });
    },
    // Update selected bus
    setSelectedBus(selectedBus: BU[]) {
      patchState(store, { selectedBus });
      const ids = selectedBus.map(({ id }) => id).join(',');
      setQueryParams({ bus_ids: ids });
    },
  })),

  withHooks(({ ideasCount, queryParams }) => ({
    onInit: () => {
      ideasCount(queryParams);
    },
  }))
);
