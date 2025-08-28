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
import { Department } from '../../../core/crud/departments/department.model';
import { withKpisFeature } from '../../../core/crud/with-kpis.feature';
import { createDognutChart } from '../helpers/charts.helper';
import { DepartmentIdeaCount } from './ideas-by-department.model';
import { IdeasByDepartmentService } from './ideas-by-department.service';

type DepartmentDashboardState = {
  departments: Department[];
  selectedDepartments: Department[];
  departmentIdeaCounts: DepartmentIdeaCount[];
  chartOptions: any;
  loading: boolean;
  error: string | null;
};

const initialState: DepartmentDashboardState = {
  departments: [],
  selectedDepartments: [],
  departmentIdeaCounts: [],
  chartOptions: null,
  loading: false,
  error: null,
};

export const IdeasByDepartmentStore = signalStore(
  withState(initialState),

  withLoading(),

  withKpisFeature(),

  withProps(() => ({ service: inject(IdeasByDepartmentService) })),

  withComputed(({ loadingStates }) => ({
    loading: computed(() => loadingStates()['load'] || false),
  })),

  withMethods(
    ({ departmentIdeaCounts, selectedDepartments, departments, ...store }) => ({
      // Update chart based on current state
      updateChart() {
        // If no plants selected, show all plants
        const departmentsToShow =
          selectedDepartments().length === 0
            ? departments()
            : selectedDepartments();

        // Filter and sort data
        const filteredData = departmentIdeaCounts()
          .filter(item =>
            departmentsToShow.some(
              department => department.id === item.departmentId
            )
          )
          .sort((a, b) => b.count - a.count);

        // Prepare chart data
        const xAxisData = filteredData.map(item => item.departmentName);
        const seriesData = filteredData.map(item => ({
          value: item.count,
          name: item.departmentName,
        }));

        const chartOptions = createDognutChart(xAxisData, seriesData, 'Ideas');
        patchState(store, { chartOptions });
      },
    })
  ),

  withMethods(
    ({ service, startLoading, stopLoading, updateChart, ...store }) => ({
      // Ideas by plant count
      ideasCount: rxMethod<QueryParamType>(
        pipe(
          tap(() => startLoading('load')),
          switchMap(params =>
            service.ideasCount(params).pipe(
              tapResponse({
                next: departmentIdeaCounts => {
                  patchState(store, { departmentIdeaCounts });
                  updateChart();
                },

                error: err =>
                  console.error(
                    'Error loading ideas count by departments: ',
                    err
                  ),
                finalize: () => stopLoading('load'),
              })
            )
          )
        )
      ),
    })
  ),

  withMethods(({ setQueryParams, ...store }) => ({
    setDepartments: (departments: Department[]) => {
      patchState(store, { departments });
    },
    // Update selected departments
    setSelectedDepartments(selectedDepartments: Department[]) {
      patchState(store, { selectedDepartments });
      const ids = selectedDepartments.map(({ id }) => id).join(',');
      setQueryParams({ departments_ids: ids });
    },
  })),

  withHooks(({ ideasCount, queryParams }) => ({
    onInit: () => {
      ideasCount(queryParams);
    },
  }))
);
