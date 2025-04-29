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
import { Plant } from '../../../core/crud/plants/plant.model';
import { withKpisFeature } from '../../../core/crud/with-kpis.feature';
import { PlantIdeaCount } from './ideas-by-plant.model';
import { IdeasByPlantService } from './ideas-by-plants.service';
import { createDognutChart } from '../helpers/charts.helper';

type PlantDashboardState = {
  plants: Plant[];
  selectedPlants: Plant[];
  plantIdeaCounts: PlantIdeaCount[];
  chartOptions: any;
  loading: boolean;
  error: string | null;
};

const initialState: PlantDashboardState = {
  plants: [],
  selectedPlants: [],
  plantIdeaCounts: [],
  chartOptions: null,
  loading: false,
  error: null,
};

export const IdeasByPlantStore = signalStore(
  withState(initialState),

  withLoading(),

  withKpisFeature(),

  withProps(() => ({ service: inject(IdeasByPlantService) })),

  withComputed(({ loadingStates }) => ({
    loading: computed(() => loadingStates()['load'] || false),
  })),

  withMethods(({ plantIdeaCounts, selectedPlants, plants, ...store }) => ({
    // Update chart based on current state
    updateChart() {
      // If no plants selected, show all plants
      const plantsToShow =
        selectedPlants().length === 0 ? plants() : selectedPlants();

      // Filter and sort data
      const filteredData = plantIdeaCounts()
        .filter(item => plantsToShow.some(plant => plant.id === item.plantId))
        .sort((a, b) => b.count - a.count);

      // Prepare chart data
      const xAxisData = filteredData.map(item => item.plantName);
      const seriesData = filteredData.map(item => ({
        value: item.count,
        name: item.plantName,
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
                next: plantIdeaCounts => {
                  patchState(store, { plantIdeaCounts });
                  updateChart();
                },

                error: err =>
                  console.error('Error loading ideas count by plants: ', err),
                finalize: () => stopLoading('load'),
              })
            )
          )
        )
      ),
    })
  ),

  withMethods(({ setQueryParams, ...store }) => ({
    setPlants: (plants: Plant[]) => {
      patchState(store, { plants });
    },
    // Update selected plants
    setSelectedPlants(selectedPlants: Plant[]) {
      patchState(store, { selectedPlants });
      const ids = selectedPlants.map(({ id }) => id).join(',');
      setQueryParams({ plants_ids: ids });
    },
  })),

  withHooks(({ ideasCount, queryParams }) => ({
    onInit: () => {
      ideasCount(queryParams);
    },
  }))
);
