import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import { Plant, PlantCreate, PlantUpdate } from './plant.model';

@Injectable({
  providedIn: 'root',
})
export class PlantService extends CrudBaseService<
  Plant,
  PlantCreate,
  PlantUpdate
> {
  constructor() {
    super('/plants');
  }
}
