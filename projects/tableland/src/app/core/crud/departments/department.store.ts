import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore } from '@ngrx/signals';
import {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
} from './department.model';
import { DepartmentService } from './department.service';

export const DepartmentStore = signalStore(
  { providedIn: 'root' },
  withPagedEntities<Department, DepartmentCreate, DepartmentUpdate>(
    DepartmentService
  ),
  withSimpleEntities<Department>(DepartmentService)
);
