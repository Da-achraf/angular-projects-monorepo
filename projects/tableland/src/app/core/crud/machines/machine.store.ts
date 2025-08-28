import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore } from '@ngrx/signals';
import { Machine, MachineCreate, MachineUpdate } from './machine.model';
import { MachineService } from './machine.service';

type BuState = {};
const initialState: BuState = {};

export const MachineStore = signalStore(
  { providedIn: 'root' },
  withPagedEntities<Machine, MachineCreate, MachineUpdate>(MachineService),
  withSimpleEntities<Machine>(MachineService)
);
