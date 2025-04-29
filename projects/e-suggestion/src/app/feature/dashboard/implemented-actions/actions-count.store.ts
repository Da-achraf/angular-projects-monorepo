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
import { EChartsOption } from 'echarts/types/dist/shared';
import { pipe, switchMap, tap } from 'rxjs';
import { QueryParamType } from '../../../core/api/api.model';
import { withKpisFeature } from '../../../core/crud/with-kpis.feature';
import { ActionsCount, MockData } from './actions-count.model';
import { ActionsCountService } from './actions-count.service';

type ActionsCountState = {
  departments: string[];
  actionsCount: ActionsCount;
  chartOptions: any;
  loading: boolean;
  error: string | null;
};

const initialState: ActionsCountState = {
  departments: [],
  actionsCount: {},
  chartOptions: null,
  loading: false,
  error: null,
};

export const ActionsCountStore = signalStore(
  withState(initialState),

  withLoading(),

  withKpisFeature(),

  withProps(() => ({ service: inject(ActionsCountService) })),

  withComputed(({ loadingStates }) => ({
    loading: computed(() => loadingStates()['load'] || false),
  })),

  withMethods(({ actionsCount, ...store }) => ({
    // Update chart based on current state
    updateChart() {
      const chartOptions = createChart(actionsCount());
      patchState(store, { chartOptions });
    },
  })),

  withMethods(
    ({ service, startLoading, stopLoading, updateChart, ...store }) => ({
      // Ideas by plant count
      loadActionsCount: rxMethod<QueryParamType>(
        pipe(
          tap(() => startLoading('load')),
          switchMap(params =>
            service.actionsCount(params).pipe(
              tapResponse({
                next: actionsCount => {
                  patchState(store, { actionsCount });
                  updateChart();
                },

                error: err =>
                  console.error('Error loading actions count: ', err),
                finalize: () => stopLoading('load'),
              })
            )
          )
        )
      ),
    })
  ),

  withMethods(({ setQueryParams, ...store }) => ({
    setDepartments: (departments: string[]) => {
      patchState(store, { departments });
    },

    // set mock data
    setData: (actionsCount: ActionsCount) => {
      patchState(store, { actionsCount });
    },
  })),

  withHooks(({ loadActionsCount, setData, updateChart, queryParams }) => ({
    onInit: () => {
      // loadActionsCount(queryParams);
      setData(MockData);

      updateChart();
    },
  }))
);

const createChart = (data: ActionsCount): EChartsOption => {
  // Sort departments by unimplemented actions (descending)
  const sortedDepartments = Object.entries(data).sort(
    (a, b) => b[1].unimplemented - a[1].unimplemented
  );

  const departments = sortedDepartments.map(([dept]) => dept);
  const implementedValues = sortedDepartments.map(
    ([, counts]) => counts.implemented
  );
  const unimplementedValues = sortedDepartments.map(
    ([, counts]) => counts.unimplemented
  );
  const totalValues = sortedDepartments.map(
    ([, counts]) => counts.implemented + counts.unimplemented
  );
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let imp = 0,
          unimp = 0;
        params.forEach((p: any) => {
          if (p.seriesName === 'Implemented') imp = p.value;
          if (p.seriesName === 'Unimplemented') unimp = p.value;
        });
        return `Department: ${params[0].name}<br/>
                  Implemented: ${imp}<br/>
                  Unimplemented: ${unimp}<br/>
                  Total: ${imp + unimp}`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: departments,
      axisLabel: {
        width: 120,
        formatter: (value: string, index: number) => {
          // Append the total to the department name
          return `${value} (${totalValues[index]})`;
        },
      },
    },
    series: [
      {
        name: 'Implemented',
        type: 'bar',
        barGap: '0%',
        data: implementedValues.map(value => ({
          value,

          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#A8E6CF' }, // Start color (light green)
                { offset: 1, color: '#5EB087' }, // End color (medium green)
              ],
            },
          },
        })),
        barWidth: '40%',
        label: {
          show: true,
          position: 'insideRight',
          color: '#fff',
          formatter: '{c}',
        },
      },
      {
        name: 'Unimplemented',
        type: 'bar',
        barGap: '0%',
        data: unimplementedValues.map(value => ({
          value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#FF8B94' }, // Start color (light red)
                { offset: 1, color: '#C86C89' }, // End color (medium red)
              ],
            },
          },
        })),
        barWidth: '40%',
        label: {
          show: true,
          position: 'insideRight',
          color: '#fff',
          formatter: '{c}',
        },
      },
    ],
  };
};
