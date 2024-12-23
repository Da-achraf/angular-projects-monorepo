import { inject, ProviderToken } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
    patchState,
    signalStoreFeature,
    withMethods,
    withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, Observable, pipe } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { withLoading } from './with-loading';

export interface WithPagedEntityState<Entity> {
    entities: Entity[];
    page: number;
    total: number;
}

export function withPagedEntities<Entity extends { id: number }>(
    Loader: ProviderToken<{
        load: (
            page: number,
        ) => Observable<{ content: Entity[]; page: number; total: number }>;
    }>,
) {
    return signalStoreFeature(
        withLoading(),
        withState<WithPagedEntityState<Entity>>({
            entities: [] as Entity[],
            page: 0,
            total: 0
        }),
        withMethods((state) => {
            const loader = inject(Loader);
            return {
                load: rxMethod<number>(
                    pipe(
                        tap((page) => patchState(state, { page })),
                        debounceTime(1000),
                        distinctUntilChanged(),
                        tap(() => state.setLoading(true)),
                        switchMap((page) => loader.load(page)),
                        tapResponse({
                            next: (response) => {
                                patchState(state, {
                                    entities: response.content,
                                    page: response.page,
                                    total: response.total,
                                });
                            },
                            error: console.error,
                            finalize: () => state.setLoading(false)
                        }),
                    ),
                ),
                nextPage() {
                    const page = state.page();
                    if (page >= state.total()) {
                        return;
                    }

                    this.load(page + 1);
                },
                previousPage() {
                    const page = state.page();
                    if (page <= 1) {
                        return;
                    }

                    this.load(page - 1);
                }
            };
        })
    );
}