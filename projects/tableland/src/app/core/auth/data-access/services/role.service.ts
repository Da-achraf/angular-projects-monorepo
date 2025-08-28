import { Injectable } from '@angular/core';
import { CrudBaseService } from '../../../crud/crud-base.service';
import { Role, RoleCreate, RoleUpdate } from '../role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService extends CrudBaseService<Role, RoleCreate, RoleUpdate> {
  constructor() {
    super('/roles');
  }
}
