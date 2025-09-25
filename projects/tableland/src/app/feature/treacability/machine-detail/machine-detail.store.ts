import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { ToasterService } from '@ba/core/data-access';
import { API_URL } from '@ba/core/http-client';
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
import {
  catchError,
  EMPTY,
  firstValueFrom,
  from,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BOM } from '../../../core/crud/boms/bom.model';
import { BOMService } from '../../../core/crud/boms/bom.service';
import { CacheService } from '../../../core/services/cache.service';
import { TraceabilityService } from '../../../core/services/traceability.service';
import {
  Machine,
  MachineStatus,
  VerificationRecord,
} from './machine-detail.model';

export interface LoadingState {
  machine: boolean;
  status: boolean;
  cachedData: boolean;
  bom: boolean;
  verificationRecords: boolean;

  // triggered when trying to confirm after the connection with machine script was lost
  isConfirming: boolean;
}

export interface MachineDetailState {
  machine: Machine | null;
  status: MachineStatus | undefined;
  areaId: number | undefined;
  pn: string;
  po: string;
  bom: BOM[];
  verifiedRecords: VerificationRecord[];
  loading: LoadingState;
  error: string | null;
}

export interface ViewState {
  isLoading: boolean;
  canShowInterface: boolean;
  showScanning: boolean;
  showBom: boolean;
  showMaterialReplenishment: boolean;
}

const initialState: MachineDetailState = {
  machine: null,
  status: undefined,
  areaId: undefined,
  pn: '',
  po: '',
  bom: [],
  verifiedRecords: [],
  loading: {
    machine: true,
    status: false,
    cachedData: false,
    bom: false,
    verificationRecords: false,
    isConfirming: false,
  },
  error: null,
};

export const MachineDetailStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withProps(() => ({
    http: inject(HttpClient),
    bomService: inject(BOMService),
    cacheService: inject(CacheService),
    traceabilityService: inject(TraceabilityService),
    toaster: inject(ToasterService),
    url: inject(API_URL),
  })),

  withComputed(({ machine, status, loading }) => ({
    // Derived selectors
    machineName: computed(() => machine()?.name),

    // View state computed from app state
    viewState: computed<ViewState>(() => {
      const loadingState = loading();
      const machineStatus = status();
      const isLoading = Object.values(loadingState).some(loading => loading);

      // Only show interfaces when all critical data is loaded
      const canShowInterface =
        !loadingState.machine &&
        !loadingState.status &&
        !loadingState.cachedData;

      return {
        isLoading,
        canShowInterface,
        showScanning:
          canShowInterface &&
          (machineStatus === MachineStatus.Ready ||
            machineStatus === undefined),
        showBom: canShowInterface && machineStatus === MachineStatus.Active,
        showMaterialReplenishment:
          canShowInterface && machineStatus === MachineStatus.Starved,
      };
    }),

    // Additional computed properties for template convenience
    isAnyLoading: computed(() => {
      const loadingState = loading();
      return Object.values(loadingState).some(loading => loading);
    }),

    canShowScanning: computed(() => {
      const loadingState = loading();
      const machineStatus = status();
      const canShowInterface =
        !loadingState.machine &&
        !loadingState.status &&
        !loadingState.cachedData;

      return (
        canShowInterface &&
        (machineStatus === MachineStatus.Ready || machineStatus === undefined)
      );
    }),

    canShowBom: computed(() => {
      const loadingState = loading();
      const machineStatus = status();
      const canShowInterface =
        !loadingState.machine &&
        !loadingState.status &&
        !loadingState.cachedData;

      return (
        canShowInterface &&
        (machineStatus === MachineStatus.Active ||
          machineStatus === MachineStatus.Starved)
      );
    }),

    canShowMaterialReplenishment: computed(() => {
      const loadingState = loading();
      const machineStatus = status();
      const canShowInterface =
        !loadingState.machine &&
        !loadingState.status &&
        !loadingState.cachedData;

      return canShowInterface && machineStatus === MachineStatus.Starved;
    }),
  })),

  withMethods(({ bomService, cacheService, areaId, ...store }) => ({
    // Load BOM
    loadBom: (pn: string, machineName: string) => {
      patchState(store, state => ({
        loading: { ...state.loading, bom: true },
      }));

      from(cacheService.getNested<BOM[]>(machineName.toLowerCase(), 'bom'))
        .pipe(
          switchMap(cachedBom => {
            if (cachedBom && cachedBom.length > 0) {
              // Return cached result if found
              return of(cachedBom);
            }
            // Not found → fall back to API call
            return bomService.loadBom(pn, machineName);
          })
        )
        .subscribe({
          next: bom => {
            patchState(store, {
              bom,
              loading: { ...store.loading(), bom: false },
            });
          },
          error: error => {
            console.error('Error loading BOM:', error);
            patchState(store, state => ({
              loading: { ...state.loading, bom: false },
            }));
          },
        });
    },

    // Load verification records
    rxloadVerificationRecords: rxMethod<string | undefined>(
      pipe(
        filter((machineName): machineName is string => !!machineName),
        switchMap(machineName => {
          // Set loading true before starting
          patchState(store, state => ({
            loading: { ...state.loading, verificationRecords: true },
          }));

          return from(
            cacheService.getNested<Record<string, VerificationRecord>>(
              machineName.toLowerCase(),
              'history'
            )
          ).pipe(
            tap(response => {
              const mappedRecords = Object.values(
                response || {}
              ) as VerificationRecord[];

              patchState(store, {
                verifiedRecords: mappedRecords,
                loading: { ...store.loading(), verificationRecords: false },
              });
            }),
            catchError(error => {
              console.error('Error loading verification records:', error);
              patchState(store, {
                verifiedRecords: [],
                loading: { ...store.loading(), verificationRecords: false },
              });
              return EMPTY;
            })
          );
        })
      )
    ),

    // Load verification records
    loadVerificationRecords: async (machineName: string) => {
      patchState(store, state => ({
        loading: { ...state.loading, verificationRecords: true },
      }));

      try {
        const response = await cacheService.getNested<
          Record<string, VerificationRecord>
        >(machineName.toLowerCase(), 'history');

        const mappedRecords = Object.values(
          response || {}
        ) as VerificationRecord[];

        patchState(store, {
          verifiedRecords: mappedRecords,
          loading: { ...store.loading(), verificationRecords: false },
        });
      } catch (error) {
        console.error('Error loading verification records:', error);
        patchState(store, {
          verifiedRecords: [],
          loading: { ...store.loading(), verificationRecords: false },
        });
      }
    },

    // Helper methods
    cacheScannedData: async (
      result: { po: string; pn: string },
      machineName: string,
      bom: BOM[]
    ) => {
      await cacheService.setNested(
        machineName.toLowerCase(),
        'current_po',
        result.po
      );
      await cacheService.setNested(
        machineName.toLowerCase(),
        'current_pn',
        result.pn
      );
      await cacheService.setNested(machineName.toLowerCase(), 'bom', bom);
    },

    setStatus: async (machineName: string, status: MachineStatus) => {
      const _areaId = areaId();

      if (_areaId)
        await cacheService.setMachineStatus(
          machineName.toLowerCase(),
          'status',
          status,
          _areaId
        );
    },
  })),

  withMethods(
    ({ cacheService, loadBom, loadVerificationRecords, ...store }) => ({
      // Load machine status and cached data
      loadMachineStatusAndCachedData: async (machineName: string) => {
        patchState(store, state => ({
          loading: { ...state.loading, status: true, cachedData: true },
        }));

        try {
          // Load status and cached data
          const statusResponse = await cacheService.getNested<string>(
            machineName.toLowerCase(),
            'status'
          );
          const cachedPn = await cacheService.getNested<string>(
            machineName.toLowerCase(),
            'current_pn'
          );
          const cachedPo = await cacheService.getNested<string>(
            machineName.toLowerCase(),
            'current_po'
          );

          // Update state with all loaded data
          patchState(store, {
            status: statusResponse as MachineStatus,
            pn: cachedPn || '',
            po: cachedPo || '',
            loading: {
              ...store.loading(),
              status: false,
              cachedData: false,
            },
          });

          // Load BOM if we have cached PN
          if (cachedPn) {
            loadBom(cachedPn, machineName);
          }

          // Load verification records if status is active
          if (statusResponse === MachineStatus.Active) {
            loadVerificationRecords(machineName);
          }
        } catch (error) {
          console.error('Error loading machine status and cached data:', error);
          patchState(store, state => ({
            loading: { ...state.loading, status: false, cachedData: false },
          }));
        }
      },
    })
  ),

  withMethods(
    ({
      http,
      url,
      bomService,
      cacheService,
      traceabilityService,
      toaster,
      cacheScannedData,
      setStatus,
      ...store
    }) => ({
      // State update helpers
      updateLoading: (loadingUpdates: Partial<LoadingState>) => {
        patchState(store, state => ({
          loading: { ...state.loading, ...loadingUpdates },
        }));
      },

      setError: (error: string | null) => {
        patchState(store, { error });
      },

      clearError: () => {
        patchState(store, { error: null });
      },

      // Reset state
      resetState: () => {
        patchState(store, initialState);
      },

      setAreaId: (areaId: number) => {
        patchState(store, { areaId });
      },

      // Load machine data
      loadMachine: rxMethod<string>(
        pipe(
          tap(() =>
            patchState(store, state => ({
              loading: { ...state.loading, machine: true },
              error: null,
            }))
          ),
          switchMap(machineId =>
            http.get<any>(`${url}/machines/${machineId}`).pipe(
              map(r => r.data as Machine),
              tap(machine => {
                patchState(store, {
                  machine,
                  loading: { ...store.loading(), machine: false },
                });

                // Trigger loading status and cached data when machine loads
                if (machine.name) {
                  store.loadMachineStatusAndCachedData(machine.name);
                }
              }),
              catchError(error => {
                console.error('Error loading machine:', error);
                patchState(store, state => ({
                  loading: { ...state.loading, machine: false },
                }));
                return of(null);
              })
            )
          )
        )
      ),

      // Handle scanned result
      handleScannedResult: async (result: { po: string; pn: string }) => {
        const machineName = store.machineName();
        if (!machineName) return;

        try {
          patchState(store, state => ({
            loading: { ...state.loading, bom: true },
          }));

          // Load BOM and cache data in parallel
          const bom = await firstValueFrom(
            bomService.loadBom(result.pn, machineName)
          );

          await cacheScannedData(result, machineName, bom);
          await setStatus(machineName, MachineStatus.Starved);

          // Update state with new data
          patchState(store, {
            bom,
            pn: result.pn,
            po: result.po,
            status: MachineStatus.Active,
            loading: { ...store.loading(), bom: false },
          });

          // Load verification records for active status
          store.loadVerificationRecords(machineName);
        } catch (error) {
          console.error('Error handling scanned result:', error);
          toaster.showError('No BOM found for the requested PN');
          patchState(store, state => ({
            loading: { ...state.loading, bom: false },
          }));
        }
      },

      // Handle material replenishment
      handleMaterialReplenishment: async () => {
        const machineName = store.machineName();
        if (!machineName) return;

        patchState(store, state => ({
          loading: { ...state.loading, status: true },
        }));

        try {
          const statusResponse = await cacheService.getNested<string>(
            machineName.toLowerCase(),
            'status'
          );

          patchState(store, {
            status: statusResponse as MachineStatus,
            loading: { ...store.loading(), status: false },
          });
        } catch (error) {
          console.error('Error reloading machine status:', error);
          patchState(store, state => ({
            loading: { ...state.loading, status: false },
          }));
        }
      },

      /**
       * The rescan here is not related to raw materials,
       * the function handles when the machine is done with a po/pn
       * and the user clicks Rescan button to work on another po/pn.
       *
       */
      handleRescanRequest: async (areaId: number) => {
        const machineName = store.machineName();
        if (!machineName) {
          console.error('Machine name not available for rescan');
          return;
        }

        try {
          // Update status to 'ready' in cache and clear cached data
          await cacheService.setMachineStatus(
            machineName.toLowerCase(),
            'status',
            MachineStatus.Ready,
            areaId
          );

          await cacheService.deleteNested(
            machineName.toLowerCase(),
            'current_pn'
          );
          await cacheService.deleteNested(
            machineName.toLowerCase(),
            'current_po'
          );
          await cacheService.deleteNested(machineName.toLowerCase(), 'history');
          await cacheService.deleteNested(machineName.toLowerCase(), 'bom');

          // Update local state
          patchState(store, {
            status: MachineStatus.Ready,
            pn: '',
            po: '',
            bom: [],
            verifiedRecords: [],
          });
        } catch (error) {
          console.error('Error updating status for rescan:', error);
          toaster.showError('Failed to initiate rescan');
          patchState(store, { error: 'Failed to initiate rescan' });
        }
      },

      reloadAllData: async () => {
        const machineName = store.machineName();
        if (!machineName) {
          console.warn('Cannot reload data: machine name not available');
          return;
        }

        // Set all loading states to true
        patchState(store, state => ({
          loading: {
            ...state.loading,
            status: true,
            cachedData: true,
            bom: true,
            verificationRecords: true,
          },
          error: null,
        }));

        try {
          // Load status and cached data in parallel
          const [statusResponse, cachedPn, cachedPo] = await Promise.all([
            cacheService.getNested<string>(machineName.toLowerCase(), 'status'),
            cacheService.getNested<string>(
              machineName.toLowerCase(),
              'current_pn'
            ),
            cacheService.getNested<string>(
              machineName.toLowerCase(),
              'current_po'
            ),
          ]);

          // Update basic state
          patchState(store, {
            status: statusResponse as MachineStatus,
            pn: cachedPn || '',
            po: cachedPo || '',
            loading: {
              ...store.loading(),
              status: false,
              cachedData: false,
            },
          });

          // Load BOM if we have cached PN
          if (cachedPn) {
            try {
              const cachedBom = await cacheService.getNested<BOM[]>(
                machineName.toLowerCase(),
                'bom'
              );

              if (cachedBom && cachedBom.length > 0) {
                // Use cached BOM
                patchState(store, {
                  bom: cachedBom,
                  loading: { ...store.loading(), bom: false },
                });
              } else {
                // Fallback to API call
                const bom = await firstValueFrom(
                  bomService.loadBom(cachedPn, machineName)
                );
                patchState(store, {
                  bom,
                  loading: { ...store.loading(), bom: false },
                });
              }
            } catch (bomError) {
              console.error('Error loading BOM during reload:', bomError);
              patchState(store, {
                bom: [],
                loading: { ...store.loading(), bom: false },
              });
            }
          } else {
            // No PN cached, clear BOM
            patchState(store, {
              bom: [],
              loading: { ...store.loading(), bom: false },
            });
          }

          // Load verification records if status is active or starved
          if (
            statusResponse === MachineStatus.Active ||
            statusResponse === MachineStatus.Starved
          ) {
            try {
              const response = await cacheService.getNested<
                Record<string, VerificationRecord>
              >(machineName.toLowerCase(), 'history');

              const mappedRecords = Object.values(
                response || {}
              ) as VerificationRecord[];

              patchState(store, {
                verifiedRecords: mappedRecords,
                loading: { ...store.loading(), verificationRecords: false },
              });
            } catch (recordsError) {
              console.error(
                'Error loading verification records during reload:',
                recordsError
              );
              patchState(store, {
                verifiedRecords: [],
                loading: { ...store.loading(), verificationRecords: false },
              });
            }
          } else {
            // Clear verification records for other statuses
            patchState(store, {
              verifiedRecords: [],
              loading: { ...store.loading(), verificationRecords: false },
            });
          }
        } catch (error) {
          console.error('Error during complete data reload:', error);
          patchState(store, {
            error: 'Failed to reload data',
            loading: {
              machine: false,
              isConfirming: false,
              status: false,
              cachedData: false,
              bom: false,
              verificationRecords: false,
            },
          });
        }
      },

      /**
       * Notify the backend that the machine can resume production.
       * When all raw materials were verified successfully for the first time after po/pn scan.
       * It will notify the backend in order to feed the csv file in the machine.
       *
       */
      resumeProd: async () => {
        const machineName = store.machineName();
        if (!machineName) return;

        try {
          patchState(store, state => ({
            loading: { ...state.loading, isConfirming: true },
          }));
          await traceabilityService.resumeProd(machineName);
        } catch (error) {
          throw error;
        } finally {
          patchState(store, state => ({
            loading: { ...state.loading, isConfirming: false },
          }));
        }
      },
    })
  ),

  withHooks(({ reloadAllData }) => ({
    onInit: async () => {
      await reloadAllData();
      // rxloadVerificationRecords(machineName);
    },
  }))
);
