import { Injectable } from '@angular/core';
import { CrudBaseService } from '../crud-base.service';
import { Category, CategoryCreate, CategoryUpdate } from './category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends CrudBaseService<
  Category,
  CategoryCreate,
  CategoryUpdate
> {
  constructor() {
    super('/categories');
  }
}
