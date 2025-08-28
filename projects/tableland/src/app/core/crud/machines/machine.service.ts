import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import { Machine, MachineCreate, MachineUpdate } from './machine.model';

@Injectable({
  providedIn: 'root',
})
export class MachineService extends CrudBaseService<
  Machine,
  MachineCreate,
  MachineUpdate
> {
  constructor() {
    super('/machines');
  }
}
