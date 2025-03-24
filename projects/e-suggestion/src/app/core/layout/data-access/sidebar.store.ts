import { Location } from "@angular/common";
import { computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { filter, map } from "rxjs";
import { withAuth } from "../../auth/data-access/auth.store";
import { SidebarItem } from "./sidebar.model";

type SidebarState = {
    isOpen: boolean;
    sidebarItems: SidebarItem[];
    path: string;
    openedItem: SidebarItem | undefined;
    openedItemY: number;
    menuHovered: boolean;
};

const initialState: SidebarState = {
    isOpen: true,
    sidebarItems: [],
    path: '',
    openedItem: undefined,
    openedItemY: 0,
    menuHovered: false
};

export const SidebarStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withAuth(),
    withProps(() => ({
        router: inject(Router),
        location: inject(Location),
    })),

    // Computed values
    withComputed(({ router, location, sidebarItems, user, path }) => ({

        // Filtered sidebar items based on user role
        filteredItems: computed(() =>
            sidebarItems().filter(i =>
                !i.allowedRoles ||
                i.allowedRoles.some(r => user().roles.some(ur => ur.name === r))
            )
        ),

        // Current path from router events
        path: toSignal(
            router.events.pipe(
                filter(event => event instanceof NavigationEnd),
                map((val: any) => (val as NavigationEnd).url)
            ),
            { initialValue: location.path() }
        ),

        // Active menu item based on current path
        navigatedToMenu: computed(() => {
            return sidebarItems().find(
                item => item.isMenu && item.children?.some(ch => ch.link === path())
            );
        }),
    })),

    // Methods
    withMethods(({ router, ...store }) => ({
        // Toggle sidebar
        toggleSidebar() {
            patchState(store, { isOpen: !store.isOpen });
        },

        // Toggle menu visibility for a specific item
        toggleMenu(item: SidebarItem) {
            const updatedItems = store.filteredItems().map(i =>
                i.label === item.label ? { ...i, menuVisible: !i.menuVisible } : i
            );
            patchState(store, {sidebarItems: updatedItems})
        },

        // Close all menus
        closeAllMenus() {
            const updates = store.filteredItems().map(i => ({ ...i, menuVisible: false }))
            patchState(store, { sidebarItems: updates})
        },
    })),
);