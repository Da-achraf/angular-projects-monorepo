import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
} from './department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService extends CrudBaseService<
  Department,
  DepartmentCreate,
  DepartmentUpdate
> {
  constructor() {
    super('/departments');
  }
}
