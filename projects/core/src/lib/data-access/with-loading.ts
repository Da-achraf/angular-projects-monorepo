import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';

export interface LoadingState {
  loadingStates: Record<string, boolean>;
}

export const withLoading = () =>
  signalStoreFeature(
    withState<LoadingState>({ loadingStates: {} }),
    withMethods((state) => ({
      // Start loading for a specific key
      startLoading: (key: string) => {
        patchState(state, {
          loadingStates: { ...state.loadingStates(), [key]: true },
        });
      },
      // Stop loading for a specific key
      stopLoading: (key: string) => {
        patchState(state, {
          loadingStates: { ...state.loadingStates(), [key]: false },
        });
      },
      // Set loading state directly (optional)
      setLoading: (key: string, value: boolean) => {
        patchState(state, {
          loadingStates: { ...state.loadingStates(), [key]: value },
        });
      },
    }))
  );
