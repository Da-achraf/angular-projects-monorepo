import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore, withState } from '@ngrx/signals';
import { BU, BUCreate, BUUpdate } from './bu.model';
import { BUService } from './bu.service';

type BuState = {};
const initialState: BuState = {};

export const BUStore = signalStore(
  { providedIn: 'root' },
  withState<BuState>(initialState),
  withPagedEntities<BU, BUCreate, BUUpdate>(BUService),
  withSimpleEntities<BU>(BUService)
);
