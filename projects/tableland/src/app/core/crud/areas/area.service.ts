import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import { Area, AreaCreate, AreaUpdate } from './area.model';

@Injectable({
  providedIn: 'root',
})
export class AreaService extends CrudBaseService<Area, AreaCreate, AreaUpdate> {
  constructor() {
    super('/areas');
  }
}
