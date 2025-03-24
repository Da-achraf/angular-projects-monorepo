import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import { BU, BUCreate, BUUpdate } from './bu.model';

@Injectable({
  providedIn: 'root',
})
export class BUService extends CrudBaseService<BU, BUCreate, BUUpdate> {
  constructor() {
    super('/bus');
  }
}
