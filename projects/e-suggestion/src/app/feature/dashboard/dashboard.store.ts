import { signalStore, withComputed } from '@ngrx/signals';
import { withAuth } from '../../core/auth/data-access/auth.store';

export const HomeDashboardStore = signalStore(
  withAuth(),
  withComputed(() => ({}))
);
