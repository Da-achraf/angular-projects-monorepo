import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { QueryParamType } from '../api/api.model';

type State = {
  queryParams: QueryParamType;
};

const initialState: State = {
  queryParams: {},
};

export const withKpisFeature = () =>
  signalStoreFeature(
    withState(initialState),

    withMethods(store => ({
      initializeQueryParams: (queryParams: { [key: string]: any }) => {
        patchState(store, { queryParams });
      },

      setQueryParams: (params: { [key: string]: any }) => {
        patchState(store, {
          queryParams: { ...store.queryParams(), ...params },
        });
      },
    }))
  );
