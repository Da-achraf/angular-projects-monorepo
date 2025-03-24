import { CommonModule, TitleCasePipe } from '@angular/common';
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
import { UpdateUser } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.model';
import { RoleStore } from 'projects/e-suggestion/src/app/core/auth/data-access/role.store';
import { BUStore } from 'projects/e-suggestion/src/app/core/crud/bus/bu.store';
import { PlantStore } from 'projects/e-suggestion/src/app/core/crud/plants/plant.store';
import { UsersStore } from '../../../../core/auth/data-access/services/users.store';
import { DeleteDialogComponent } from '../../../../pattern/dialogs/delete-dialog.component';
import { GenericTableComponent } from '../../../../ui/components/table/generic-table.component';
import { EditUserDialogComponent } from '../edit-user/edit-user.component';
import { COLUMNS, GLOBAL_FILTER_FIELDS } from './consts';

@Component({
  selector: 'ba-users-list',
  imports: [
    MatProgressSpinnerModule,
    TitleCasePipe,
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

  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  providers: [PlantStore, BUStore, RoleStore],
})
export class UsersListComponent {
  protected readonly store = inject(UsersStore);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  private readonly buStore = inject(BUStore);
  private readonly plantStore = inject(PlantStore);
  private readonly roleStore = inject(RoleStore);

  protected isHoveredUser = signal<number | undefined>(undefined);
  protected columns = signal(COLUMNS).asReadonly();
  protected globalFilterFields = signal(GLOBAL_FILTER_FIELDS).asReadonly();

  protected users = this.store.entities;
  protected total = this.store.total;

  onToggleAccountStatus(ev: Event, id: number) {

    const updateUser: Partial<UpdateUser> = {
      id,
      account_status: (ev.target as HTMLInputElement).checked
    }

    this.store.update(updateUser)
  }

  onDelete(id: number) {
    this.dialog
      .open(DeleteDialogComponent, {
        data: { label: 'user' },
        minWidth: '40vw',
        maxHeight: '95vh',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res && res?.type === 'delete') this.store.deleteOne(id);
        },
      });
  }

  onEdit(id: number) {
    const user = this.users().find((u) => u.id === id);
    if (!user) return;

    this.dialog
      .open(EditUserDialogComponent, {
        data: {
          user,
          bus: this.buStore.allEntities(),
          plants: this.plantStore.allEntities(),
          roles: this.roleStore.allEntities(),
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
          if (res?.type === 'delete') {
            this.onDelete(id);
          }
          if (res?.type === 'update') {
            this.store.update(res.data);
          }
        },
      });
  }

  clear(table: Table) {
    table.clear();
  }
}
