import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
import { PlantStore } from '../../../../core/crud/plants/plant.store';
import { DeleteDialogComponent } from '../../../../pattern/dialogs/delete-dialog.component';
import { GenericTableComponent } from '../../../../ui/components/table/generic-table.component';
import { AddPlantComponent } from '../add-plant/add-plant.componenet';
import { UpdatePlantComponent } from '../update-plant/update-plant.componenet';
import { COLUMNS, GLOBAL_FILTER_FIELDS } from './consts';

@Component({
  selector: 'ba-plants-list',
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
  ],

  templateUrl: './plants-list.component.html',
  styleUrl: './plants-list.component.scss',
})
export class PlantsListComponent {
  protected readonly store = inject(PlantStore);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected columns = signal(COLUMNS).asReadonly();
  protected globalFilterFields = signal(GLOBAL_FILTER_FIELDS).asReadonly();

  onDelete(id: number) {
    this.dialog
      .open(DeleteDialogComponent, {
        data: { label: 'plant' },
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
      .open(AddPlantComponent, {
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
      .open(UpdatePlantComponent, {
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
}
