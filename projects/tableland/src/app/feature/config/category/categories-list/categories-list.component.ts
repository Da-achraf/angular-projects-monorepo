import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ba/core/data-access';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { QueryParamType } from 'projects/e-suggestion/src/app/core/api/api.model';
import { CategoryStore } from 'projects/e-suggestion/src/app/core/crud/categories/category.store';
import { DeleteDialogComponent } from '../../../../pattern/dialogs/delete-dialog.component';
import { GenericTableComponent } from '../../../../ui/components/table/generic-table.component';
import { AddCategoryComponent } from '../add-category/add-category.componenet';
import { UpdateCategoryComponent } from '../update-category/update-category.componenet';
import { COLUMNS, GLOBAL_FILTER_FIELDS } from './consts';

@Component({
  selector: 'ba-categories-list',
  imports: [
    MatProgressSpinnerModule,
    TableModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    IconFieldModule,
    MatButtonModule,
    InputIconModule,
    ProgressBarModule,
    SelectModule,
    SliderModule,
    TagModule,
    GenericTableComponent,
    MatTooltipModule,
    TranslatePipe,
  ],

  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
})
export class CategoriesListComponent {
  protected readonly store = inject(CategoryStore);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected columns = signal(COLUMNS).asReadonly();
  protected globalFilterFields = signal(GLOBAL_FILTER_FIELDS).asReadonly();

  onDelete(id: number) {
    this.dialog
      .open(DeleteDialogComponent, {
        data: { label: 'category' },
        minWidth: '40vw',
        maxHeight: '95vh',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res && res?.type === 'delete') this.store.deleteOne(id);
        },
      });
  }

  onCreate() {
    this.dialog
      .open(AddCategoryComponent, {
        minWidth: '40vw',
        maxHeight: '95vh',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (!res) {
            return;
          }
          if (res?.type === 'create') {
            this.store.save(res.data);
          }
        },
      });
  }

  onEdit(id: number) {
    const entity = this.store.entityMap()[id];
    if (!entity) return;
    this.dialog
      .open(UpdateCategoryComponent, {
        data: {
          entity,
        },
        minWidth: '40vw',
        maxHeight: '95vh',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (!res) {
            return;
          }
          if (res?.type === 'update') {
            this.store.update({ id, ...res.data });
          }
        },
      });
  }

  clear(table: Table) {
    table.clear();
  }

  onFilter(filter: QueryParamType | null) {
    if (filter === null) {
      this.store.resetQueryParams();
      return;
    }

    this.store.setQueryParams(filter);
  }
}
