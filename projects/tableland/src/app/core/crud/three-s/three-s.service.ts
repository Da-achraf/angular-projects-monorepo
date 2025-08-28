import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import { ThreeS, ThreeSCreate, ThreeSUpdate } from './three-s.model';

@Injectable({
  providedIn: 'root',
})
export class ThreeSService extends CrudBaseService<
  ThreeS,
  ThreeSCreate,
  ThreeSUpdate
> {
  constructor() {
    super('/three-s');
  }
}
