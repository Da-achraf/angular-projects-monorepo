import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore } from '@ngrx/signals';
import { ThreeS, ThreeSCreate, ThreeSUpdate } from './three-s.model';
import { ThreeSService } from './three-s.service';

type ThreeSState = {};
const initialState: ThreeSState = {};

export const ThreeSStore = signalStore(
  { providedIn: 'root' },
  withPagedEntities<ThreeS, ThreeSCreate, ThreeSUpdate>(ThreeSService),
  withSimpleEntities<ThreeS>(ThreeSService)
);
