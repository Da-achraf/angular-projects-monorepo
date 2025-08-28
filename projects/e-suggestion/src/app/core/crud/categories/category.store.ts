import { withPagedEntities, withSimpleEntities } from '@ba/core/data-access';
import { signalStore } from '@ngrx/signals';
import { Category, CategoryCreate, CategoryUpdate } from './category.model';
import { CategoryService } from './category.service';

export const CategoryStore = signalStore(
  { providedIn: 'root' },
  withPagedEntities<Category, CategoryCreate, CategoryUpdate>(CategoryService),
  withSimpleEntities<Category>(CategoryService)
);
