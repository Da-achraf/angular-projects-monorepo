import { Injectable } from '@angular/core';
import { CrudBaseService } from 'projects/e-suggestion/src/app/core/crud/crud-base.service';
import {
  RatingMatrix,
  RatingMatrixCreate,
  RatingMatrixUpdate,
} from 'projects/e-suggestion/src/app/core/idea/models/rating-matrix.model';

@Injectable()
export class RatingMatrixService extends CrudBaseService<
  RatingMatrix,
  RatingMatrixCreate,
  RatingMatrixUpdate
> {
  constructor() {
    super('/rating-matrices');
  }
}
