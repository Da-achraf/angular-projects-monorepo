import { Location } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthStore } from '../../auth/data-access/auth.store';
import { SIDEBAR_ITEMS, SidebarItem } from './sidebar.model';
import { RoleEnum } from '../../auth/data-access/auth.model';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  // Injected dependencies
  private router = inject(Router)
  private location = inject(Location)
  private authStore = inject(AuthStore)

  private readonly sideNavOpenedSig = signal<boolean>(false)
  public readonly sideNavOpened = this.sideNavOpenedSig.asReadonly()

  sidebarItems = signal<SidebarItem[]>(
    SIDEBAR_ITEMS.map(item => ({ ...item, menuVisible: false }))
  )


  filteredItems = computed<SidebarItem[]>(() =>
    this.sidebarItems().filter(i =>
      !i.allowedRoles ||
      i.allowedRoles.includes(RoleEnum.ALL) ||
      i.allowedRoles.some(r => this.authStore.userRolesNames().some(ur => ur === r))
    )
  )

  path = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map((val: any) => (val as NavigationEnd).url)
  ), { initialValue: this.location.path() })


  // Methods
  openSideNav() {
    this.sideNavOpenedSig.set(true)
  }

  closeSideNav() {
    this.sideNavOpenedSig.set(false)
  }

  toggleSideNav() {
    this.sideNavOpenedSig.update(val => !val)
  }

}
