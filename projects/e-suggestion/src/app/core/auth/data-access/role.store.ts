import { withSimpleEntities } from '@ba/core/data-access';
import { signalStore, withState } from '@ngrx/signals';
import { RoleService } from './services/role.service';
import { Role } from './role.model';

type RoleState = {};
const intitialState: RoleState = {};

export const RoleStore = signalStore(
  { providedIn: 'root' },
  withState<RoleState>(intitialState),
  withSimpleEntities<Role>(RoleService)
);
